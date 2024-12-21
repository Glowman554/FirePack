import { type Config } from 'drizzle-kit';
import { config } from './backend/config.ts';

export default {
    schema: './backend/database/schema.ts',
    dialect: 'turso',
    dbCredentials: {
        ...config.database,
    },
} satisfies Config;
