import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../backend/trpc/router.ts';
import { Storage } from './storage.ts';
import { z } from 'zod';

export const api = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `http://localhost:3000/trpc`,
        }),
        ...(Deno.env.has('PACK_DEBUG') ? [loggerLink()] : []),
    ],
    transformer: superjson,
});

export async function authenticated(storage: Storage) {
    const token = storage.get('token', z.string());
    if (!token) {
        throw new Error('Not authenticated');
    }
    const status = await api.authentication.status.query({ token });
    if (!status) {
        throw new Error('Not authenticated');
    }
    return token;
}
