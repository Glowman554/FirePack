import { z } from 'zod';
import { procedure, router } from '../utils.ts';
import { permission } from './authentication.ts';
import { db } from '../../database/database.ts';
import { Projects } from '../../database/schema.ts';
import { eq, InferSelectModel } from 'drizzle-orm';

const token = z.string();
const name = z.string();

export type Project = InferSelectModel<typeof Projects>;

export async function loadProject(name: string) {
    const project = await db.select().from(Projects).where(eq(Projects.name, name)).get();
    if (!project) {
        throw new Error('Project not found');
    }
    return project;
}

export async function projectAccess(token: string, name: string) {
    const user = await permission(token, (u) => true);
    const project = await loadProject(name);
    if (project.owner != user.username) {
        throw new Error('Access denied');
    }
    return project;
}

export const projectsRouter = router({
    create: procedure.input(z.object({ token, name })).mutation(async ({ input }) => {
        const user = await permission(input.token, (u) => true);
        const project = await db.insert(Projects).values({ name: input.name, owner: user.username }).returning().get();
        return project;
    }),

    delete: procedure.input(z.object({ token, name })).mutation(async ({ input }) => {
        await projectAccess(input.token, input.name);
        await db.delete(Projects).where(eq(Projects.name, input.name));
    }),
});
