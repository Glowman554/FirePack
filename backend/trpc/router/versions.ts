import { z } from 'zod';
import { procedure, router } from '../utils.ts';
import { projectAccess } from './projects.ts';
import { config } from '../../config.ts';
import { db } from '../../database/database.ts';
import { Files, Versions } from '../../database/schema.ts';
import { and, eq } from 'drizzle-orm';

const token = z.string();
const project = z.string();
const version = z.string();

interface UploadResult {
    uploadToken: string;
    id: string;
    url: string;
}

async function prepareUpload(fileName: string) {
    const res = await fetch(config.upload.uploadServer + '/api/v1/prepare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authentication: config.upload.authToken,
        },
        body: JSON.stringify({ name: fileName }),
    });
    if (!res.ok) {
        throw new Error('Failed to prepare upload');
    }

    const json = (await res.json()) as UploadResult;
    return json;
}

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

export const versionsRouter = router({
    create: procedure
        .input(z.object({ token, project, version, files: z.array(z.string()) }))
        .mutation(async ({ input }) => {
            await projectAccess(input.token, input.project);

            const files: { [key: string]: UploadResult } = {};

            const inserted = await db
                .insert(Versions)
                .values({ version: input.version, project: input.project })
                .returning()
                .get();

            for (const f of input.files) {
                files[f] = await prepareUpload(`${input.project}@${input.version}-${f.replaceAll('/', '-')}`);
                await db.insert(Files).values({ version: inserted.id, name: f, url: files[f].url });
            }

            return files;
        }),
});
