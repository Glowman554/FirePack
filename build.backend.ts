import { buildSync } from 'esbuild';

import denoConfig from './deno.json' with { type: 'json' };

buildSync({
    entryPoints: ['backend/main.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: 'dist/backend.js',
    external: Object.keys(denoConfig.imports),
    logLevel: 'info',
});
