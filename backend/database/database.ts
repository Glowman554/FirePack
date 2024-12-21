import { createClient } from '@libsql/client/node';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema.ts';
import { hashSync } from '@node-rs/bcrypt';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { config } from '../config.ts';

export const client = createClient({ ...config.database });
export const db = drizzle(client, { schema });

await migrate(db, {
    migrationsFolder: './drizzle',
});
