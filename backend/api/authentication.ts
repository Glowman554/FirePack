import { Hono } from "hono";
import { authenticate, changePassword, login, permission, register, User } from "../common/authentication.ts";

export function getOrThrow(n: string, q: Record<string, string>) {
    if (q[n]) {
        return q[n];
    }
    throw new Error("Missing " + n)
}

export function registerAuthenticationAPI(app: Hono) {
    app.get('/authentication/status', async (c) => {
        try {
            const h = c.req.header();
            const token = getOrThrow("authentication", h);

            return c.json(await authenticate(token) ?? {});
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    });

    app.get('/authentication/login', async (c) => {
        try {
            const q = c.req.query();
            const username = getOrThrow("username", q);
            const password = getOrThrow("password", q);

            return c.json({ token: await login(username, password) });
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    });

    app.get('/authentication/register', async (c) => {
        try {
            const q = c.req.query();
            const username = getOrThrow("username", q);
            const password = getOrThrow("password", q);

            return c.json({ token: await register(username, password) });
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    });

    app.get('/authentication/changePassword', async (c) => {
        try {
            const h = c.req.header();
            const token = getOrThrow("authentication", h);

            const q = c.req.query();
            const oldPassword = getOrThrow("oldPassword", q);
            const newPassword = getOrThrow("newPassword", q);

            await changePassword(token, oldPassword, newPassword);

            return c.json({});
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    });
}