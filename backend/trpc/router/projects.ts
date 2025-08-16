import { z } from 'zod';
import { procedure, router } from '../utils.ts';
import { create, deleteProject } from "../../common/projects.ts";

const token = z.string();
const name = z.string();


export const projectsRouter = router({
    create: procedure.input(z.object({ token, name })).mutation(async ({ input }) => {
        return await create(input.token, input.name);
    }),

    delete: procedure.input(z.object({ token, name })).mutation(async ({ input }) => {
        await deleteProject(input.token, input.name);
    }),
});
