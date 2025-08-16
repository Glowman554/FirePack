import { and, eq, InferSelectModel, ne } from "drizzle-orm";
import { Sessions, Users } from "../database/schema.ts";
import { db } from "../database/database.ts";
import { compareSync, hashSync } from '@node-rs/bcrypt';
import { passwordOk, validatePassword } from "../password.ts";

export type User = Omit<InferSelectModel<typeof Users>, 'passwordHash'>;

function createRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < 100; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}

export async function createSession(username: string) {
    const token = createRandomToken();
    await db.insert(Sessions).values({ token, username });
    return token;
}

export async function authenticate(token: string) {
    const user = await db
        .select({
            username: Users.username,
            administrator: Users.administrator,
        })
        .from(Sessions)
        .where(eq(Sessions.token, token))
        .innerJoin(Users, eq(Sessions.username, Users.username))
        .get();
    return user satisfies User | undefined;
}

export async function permission(token: string, check: (u: User) => boolean) {
    const user = await authenticate(token);
    if (!user) {
        throw new Error('Not logged in');
    }

    if (!check(user)) {
        throw new Error('Missing permission');
    }

    return user;
}

export async function login(username: string, password: string) {
    const user = await db.select().from(Users).where(eq(Users.username, username)).get();
    if (!user || !compareSync(password, user.passwordHash)) {
        throw new Error('Invalid username or password');
    }
    
    const token = await createSession(username);
    return token;
}

export async function register(username: string, password: string) {
    const result = validatePassword(password);
    if (!passwordOk(result)) {
        throw new Error('Invalid password ' + JSON.stringify(result));
    }
    
    await db
        .insert(Users)
        .values({
            username: username,
            passwordHash: hashSync(password),
        })
        .onConflictDoNothing();
    
    const token = await createSession(username);
    return token;
}

export async function changePassword(token: string, oldPassword: string, newPassword: string) {
    const user = await permission(token, () => true);

    if (!passwordOk(validatePassword(newPassword))) {
        throw new Error('Password not strong enough');
    }

    const loaded = await db
        .select({ passwordHash: Users.passwordHash })
        .from(Users)
        .where(eq(Users.username, user.username))
        .get();

    if (!compareSync(oldPassword, loaded!.passwordHash)) {
        throw new Error('Invalid old password');
    }

    await db
        .update(Users)
        .set({ passwordHash: hashSync(newPassword) })
        .where(eq(Users.username, user.username));

    await db.delete(Sessions).where(and(eq(Sessions.username, user.username), ne(Sessions.token, token)));
}