import { Hono } from "hono";
import { getOrThrow } from "./authentication.ts";
import { create, deleteProject } from "../common/projects.ts";

export function registerProjectsAPI(app: Hono) {
    app.get('/projects/create/:project', async (c) => {
        try {
            const h = c.req.header();
            const token = getOrThrow("authentication", h);
    
            const name = c.req.param("project");

            return c.json(await create(token, name));
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    }); 

    app.get('/projects/delete/:project', async (c) => {
        try {
            const h = c.req.header();
            const token = getOrThrow("authentication", h);

            const name = c.req.param("project");
    
            await deleteProject(token, name);
            return c.json({});
        } catch (e) {
            return c.json({ error: String(e) }, 500);
        }
    }); 
}