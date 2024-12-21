import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { type ZodSchema } from 'zod';

export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.log(result.error);
        throw new Error('Field validation failed');
    }
    return result.data;
}

const schema = z.object({
    upload: z.object({
        uploadServer: z.string().url(),
        authToken: z.string(),
    }),
    database: z.object({ authToken: z.string().optional(), url: z.string() }),
});

export const config = validateOrThrow(schema, JSON.parse(new TextDecoder().decode(readFileSync('config.json'))));
