import { eq, InferSelectModel } from "drizzle-orm";
import { Files, Projects, Versions } from "../database/schema.ts";
import { db } from "../database/database.ts";
import { permission } from "./authentication.ts";
import { string } from "zod";
import { deleteFile, idFromUrl } from "../filething.ts";

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

export async function create(token: string, name: string) {
    const user = await permission(token, (u) => true);
    const project = await db.insert(Projects).values({ name: name, owner: user.username }).returning().get();
    return project;
}

export async function deleteProject(token: string, name: string) {
    await projectAccess(token, name);

    const files = await loadAllFiles(name);
    for (const f of files) {
        await deleteFile(idFromUrl(f.url));
    }

    await db.delete(Projects).where(eq(Projects.name, name));
}