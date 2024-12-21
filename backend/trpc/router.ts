import { z } from 'zod';
import { procedure, router } from './utils.ts';
import { authenticationRouter } from './router/authentication.ts';
import { projectsRouter } from './router/projects.ts';
import { versionsRouter } from './router/versions.ts';

export const appRouter = router({
    hello: procedure.input(z.string()).query(async ({ input }) => {
        return `Hello ${input}!`;
    }),
    authentication: authenticationRouter,
    projects: projectsRouter,
    versions: versionsRouter,
});

export type AppRouter = typeof appRouter;
