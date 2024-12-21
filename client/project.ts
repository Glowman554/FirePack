import { z } from 'zod';
import { validateOrThrow } from './storage.ts';

export const projectSchema = z.object({
    name: z.string(),
    version: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

export function loadProject() {
    const path = Deno.env.get('PACK_PROJECT_PATH') ?? 'fire.json';
    const project = Deno.readFileSync(path);
    const json = new TextDecoder().decode(project);
    return validateOrThrow(projectSchema, JSON.parse(json));
}

