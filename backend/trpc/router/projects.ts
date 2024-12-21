import { z } from 'zod';
import { procedure, router } from '../utils.ts';
import { permission } from './authentication.ts';
import { db } from '../../database/database.ts';
import { Files, Projects, Versions } from '../../database/schema.ts';
import { eq, InferSelectModel } from 'drizzle-orm';
import { deleteFile, idFromUrl } from '../../filething.ts';

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

async function loadAllFiles(project: string) {
    const files = await db
        .select({
            name: Files.name,
            url: Files.url,
        })
        .from(Projects)
        .innerJoin(Versions, eq(Projects.name, Versions.project))
        .innerJoin(Files, eq(Versions.id, Files.version))
        .where(eq(Projects.name, project));
    return files;
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

        const files = await loadAllFiles(input.name);
        for (const f of files) {
            await deleteFile(idFromUrl(f.url));
        }

        await db.delete(Projects).where(eq(Projects.name, input.name));
    }),
});
