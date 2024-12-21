import { z } from 'zod';
import { validateOrThrow } from './storage.ts';

export const compilerSchema = z.object({
    includes: z.array(z.string()),
    target: z.string().optional(),
    input: z.string(),
    output: z.string(),
});
export type Compiler = z.infer<typeof compilerSchema>;

export const projectSchema = z.object({
    name: z.string(),
    version: z.string(),
    compiler: compilerSchema.optional().nullable(),
    dependencies: z.array(z.string()).optional(),
});
export type Project = z.infer<typeof projectSchema>;

export function loadProject() {
    const path = Deno.env.get('PACK_PROJECT_PATH') ?? 'fire.json';
    const project = Deno.readFileSync(path);
    const json = new TextDecoder().decode(project);
    return validateOrThrow(projectSchema, JSON.parse(json));
}

export function saveProject(project: Project) {
    const path = Deno.env.get('PACK_PROJECT_PATH') ?? 'fire.json';
    Deno.writeFileSync(path, new TextEncoder().encode(JSON.stringify(project, null, '\t')));
}
