import { appRouter } from './trpc/router.ts';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { registerListAPI } from "./api/list.ts";
import { registerAuthenticationAPI } from "./api/authentication.ts";
import { registerProjectsAPI } from "./api/projects.ts";
import { registerVersionsAPI } from "./api/versions.ts";

async function main() {
    const app = new Hono();

    app.use('/trpc/*', trpcServer({ router: appRouter }));
    registerListAPI(app);
    registerAuthenticationAPI(app);
    registerProjectsAPI(app);
    registerVersionsAPI(app);

    const port = Number(Deno.env.get('PORT') || 3000);
    const keyPath = Deno.env.get('SERVER_KEY_PATH');
    const certPath = Deno.env.get('SERVER_CERT_PATH');

    let options: Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem) = {
        port,
    };

    if (keyPath && certPath) {
        options = {
            ...options,
            ...{
                key: await Deno.readTextFile(keyPath),
                cert: await Deno.readTextFile(certPath),
            },
        };
    }

    await Deno.serve(options, app.fetch);
}

await main();
