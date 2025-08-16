import { and, eq } from "drizzle-orm";
import { db } from "../database/database.ts";
import { Files, Versions } from "../database/schema.ts";
import { projectAccess } from "./projects.ts";
import { deleteFile, idFromUrl, prepareUpload, UploadResult } from "../filething.ts";

export async function loadFileList(project: string, version: string) {
    const files = await db
        .select({ name: Files.name, url: Files.url })
        .from(Files)
        .innerJoin(Versions, eq(Versions.id, Files.version))
        .where(and(eq(Versions.version, version), eq(Versions.project, project)));
    if (files.length == 0) {
        throw new Error('Package not found');
    }
    return files;
}

export async function create(token: string, project: string, version: string, files: string[]) {
    await projectAccess(token, project);

    const output: { [key: string]: UploadResult } = {};

    const inserted = await db
        .insert(Versions)
        .values({ version: version, project: project })
        .returning()
        .get();

    for (const f of files) {
        output[f] = await prepareUpload(`${project}@${version}-${f.replaceAll('/', '-')}`);
        await db.insert(Files).values({ version: inserted.id, name: f, url: output[f].url });
    }

    return output;
}

export async function deleteVersion(token: string, project: string, version: string) {
    await projectAccess(token, project);

    const files = await loadFileList(project, version);

    for (const f of files) {
        await deleteFile(idFromUrl(f.url));
    }

    await db.delete(Versions).where(and(eq(Versions.version, version), eq(Versions.project, project)));
}