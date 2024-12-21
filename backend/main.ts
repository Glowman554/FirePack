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

    const port = Number(Deno.env.get('PORT') || 3000);
    const keyPath = Deno.env.get('SERVER_KEY_PATH');
    const certPath = Deno.env.get('SERVER_CERT_PATH');

    const options: Deno.ServeTcpOptions = {
        port,
    };

    if (keyPath && certPath) {
        options.key = await Deno.readTextFile(keyPath);
        options.cert = await Deno.readTextFile(certPath);
    }

    await Deno.serve(options, app.fetch);
}

await main();
