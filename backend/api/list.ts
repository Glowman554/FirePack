import { Hono } from "hono";
import { loadFileList } from "../common/versions.ts";

export function registerListAPI(app: Hono) {
     app.get('/list/:project/:version', async (c) => {
        try {
            const files = await loadFileList(c.req.param('project'), c.req.param('version'));
            return c.json(files);
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    });
}