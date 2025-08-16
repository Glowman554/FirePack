import { procedure, router } from '../utils.ts';
import { z } from 'zod';
import { authenticate, changePassword, login, register } from "../../common/authentication.ts";

const token = z.string();

export const authenticationRouter = router({
    status: procedure.input(z.object({ token })).query(async ({ input }) => {
        return await authenticate(input.token);
    }),

    login: procedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async ({ input }) => {
        return await login(input.username, input.password);
    }),

    register: procedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async ({ input }) => {
        return await register(input.username, input.password);
    }),

    changePassword: procedure
        .input(z.object({ token, oldPassword: z.string(), newPassword: z.string() }))
        .mutation(async ({ input }) => {
            await changePassword(input.token, input.oldPassword, input.newPassword);
        }),
});
