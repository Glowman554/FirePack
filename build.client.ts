import { buildSync } from 'esbuild';

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
