import { and, eq, InferSelectModel, ne } from 'drizzle-orm';
import { procedure, router } from '../utils.ts';
import { Sessions, Users } from '../../database/schema.ts';
import { db } from '../../database/database.ts';
import { z } from 'zod';
import { compareSync, hashSync } from '@node-rs/bcrypt';
import { validatePassword, passwordOk } from '../../password.ts';

export type User = Omit<InferSelectModel<typeof Users>, 'passwordHash'>;

function createRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < 100; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}

async function createSession(username: string) {
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

const token = z.string();

export const authenticationRouter = router({
    status: procedure.input(z.object({ token })).query(async ({ input }) => {
        return await authenticate(input.token);
    }),

    login: procedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async ({ input }) => {
        const user = await db.select().from(Users).where(eq(Users.username, input.username)).get();
        if (!user || !compareSync(input.password, user.passwordHash)) {
            throw new Error('Invalid username or password');
        }

        const token = await createSession(input.username);
        return token;
    }),

    register: procedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async ({ input }) => {
        const result = validatePassword(input.password);
        if (!passwordOk(result)) {
            throw new Error('Invalid password ' + JSON.stringify(result));
        }

        await db
            .insert(Users)
            .values({
                username: input.username,
                passwordHash: hashSync(input.password),
            })
            .onConflictDoNothing();

        const token = await createSession(input.username);
        return token;
    }),

    changePassword: procedure
        .input(z.object({ token, oldPassword: z.string(), newPassword: z.string() }))
        .mutation(async ({ input }) => {
            const user = await permission(input.token, () => true);

            if (!passwordOk(validatePassword(input.newPassword))) {
                throw new Error('Password not strong enough');
            }

            const loaded = await db
                .select({ passwordHash: Users.passwordHash })
                .from(Users)
                .where(eq(Users.username, user.username))
                .get();

            if (!compareSync(input.oldPassword, loaded!.passwordHash)) {
                throw new Error('Invalid old password');
            }

            await db
                .update(Users)
                .set({ passwordHash: hashSync(input.newPassword) })
                .where(eq(Users.username, user.username));

            await db.delete(Sessions).where(and(eq(Sessions.username, user.username), ne(Sessions.token, input.token)));
        }),
});
