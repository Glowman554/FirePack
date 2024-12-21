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

buildSync({
    entryPoints: ['client/main.ts'],
    bundle: true,
    minify: true,
    platform: 'node',
    format: 'esm',
    outfile: 'dist/client.js',
    logLevel: 'info',
});

const cmd = new Deno.Command('deno', {
    args: ['compile', '--output', 'dist/client', '-A', 'client/main.ts'],
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
});
await cmd.output();
