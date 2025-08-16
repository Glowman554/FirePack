import { Hono } from "hono";
import { getOrThrow } from "./authentication.ts";
import { create, deleteVersion } from "../common/versions.ts";

export function registerVersionsAPI(app: Hono) {
    app.get('/versions/create/:project/:version', async (c) => {
        try {
            const h = c.req.header();
            const token = getOrThrow("authentication", h);

            const q = c.req.query();
            const files = getOrThrow("files", q).split(";");

            const project = c.req.param("project");
            const version = c.req.param("version");

            return c.json(await create(token, project, version, files));
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    }); 

    app.get('/versions/delete/:project/:version', async (c) => {
        try {
            const h = c.req.header();
            const token = getOrThrow("authentication", h);

            const project = c.req.param("project");
            const version = c.req.param("version");
    
            await deleteVersion(token, project, version);
            return c.json({});
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    }); 
}