import { appRouter } from './trpc/router.ts';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { loadFileList } from './trpc/router/versions.ts';

async function main() {
    const app = new Hono();

    app.use('/trpc/*', trpcServer({ router: appRouter }));
    app.get('/list/:project/:version', async (c) => {
        try {
            const files = await loadFileList(c.req.param('project'), c.req.param('version'));
            return c.json(files);
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    });

    Deno.serve({ port: 3000 }, app.fetch);
}

await main();
