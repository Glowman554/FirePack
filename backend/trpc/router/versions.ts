import { z } from 'zod';
import { procedure, router } from '../utils.ts';
import { create, deleteVersion } from "../../common/versions.ts";

const token = z.string();
const project = z.string();
const version = z.string();


export const versionsRouter = router({
    create: procedure
        .input(z.object({ token, project, version, files: z.array(z.string()) }))
        .mutation(async ({ input }) => {
            return await create(input.token, input.project, input.version, input.files);
        }),

    delete: procedure.input(z.object({ token, project, version })).mutation(async ({ input }) => {
        await deleteVersion(input.token, input.project, input.version);
    }),
});
