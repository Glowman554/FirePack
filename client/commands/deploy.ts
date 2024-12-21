import { api, authenticated } from '../api.ts';
import { BaseCommand } from '../command.ts';
import { loadProject } from '../project.ts';
import { Storage } from '../storage.ts';

function readDirectoryRecursive(directory: string): string[] {
    const files = Deno.readDirSync(directory);
    const result: string[] = [];
    for (const file of files) {
        if (file.isDirectory) {
            result.push(...readDirectoryRecursive(`${directory}/${file.name}`));
        } else {
            result.push(`${directory}/${file.name}`);
        }
    }
    return result;
}

async function upload(file: string, url: string, token: string) {
    const res = await fetch(url, {
        method: 'POST',
        body: Deno.readFileSync(file),
        headers: {
            Authentication: token,
        },
    });
    if (!res.ok) {
        throw new Error('Failed to upload file');
    }
}

export class DeployCommand extends BaseCommand {
    constructor(args: string[]) {
        super(args, ['--create']);
    }

    override async execute(storage: Storage) {
        const token = await authenticated(storage);
        const project = loadProject();

        console.log(`Deploying ${project.name}@${project.version}`);

        if (this.parser.isOption('--create')) {
            await api.projects.create.mutate({
                name: project.name,
                token,
            });
        }

        const files = readDirectoryRecursive('.')
            .filter((file) => !file.includes('.fire'))
            .map((file) => file.replace('./', ''));

        console.log('Uploading ' + files.length + ' ' + (files.length > 2 ? 'files' : 'file'));

        const uploadFiles = await api.versions.create.mutate({
            token,
            project: project.name,
            version: project.version,
            files,
        });

        for (const file in uploadFiles) {
            console.log('Uploading ' + file);
            await upload(file, uploadFiles[file].url, uploadFiles[file].uploadToken);
        }
    }
}
