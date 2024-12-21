import { ZodSchema } from 'zod';

let PATH = Deno.env.get('HOME') + '/.pack.json';
if (Deno.env.get('PACK_CONFIG')) {
    PATH = Deno.env.get('PACK_CONFIG')!;
    console.log('Using custom config path:', PATH);
}

export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.log(result.error);
        throw new Error('Field validation failed');
    }
    return result.data;
}

export class Storage {
    private storage: { [key: string]: unknown };
    constructor() {
        this.storage = {};
        this.load();
    }

    load() {
        try {
            const data = Deno.readFileSync(PATH);
            this.storage = JSON.parse(new TextDecoder().decode(data));
        } catch (e) {}
    }

    get<T>(key: string, schema: ZodSchema<T>): T {
        const data = this.storage[key];
        if (!data) {
            throw new Error(`Key ${key} not found`);
        }
        return validateOrThrow(schema, data);
    }

    set<T>(key: string, value: T) {
        this.storage[key] = value;
        Deno.writeFileSync(PATH, new TextEncoder().encode(JSON.stringify(this.storage, null, '\t')));
    }
}
