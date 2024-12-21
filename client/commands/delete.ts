import { api, authenticated } from '../api.ts';
import { BaseCommand } from '../command.ts';
import { Storage } from '../storage.ts';

function warning(project: string, version?: string) {
    if (version) {
        console.log(`WARNING: This will delete the version ${version} of the project ${project}`);
    } else {
        console.log(`WARNING: This will delete the project ${project}`);
    }

    const response = prompt('Do you want to continue? (yes/no) >');
    if (response != 'yes') {
        throw new Error('Aborted');
    }
}

export class DeleteCommand extends BaseCommand {
    constructor(args: string[]) {
        super(args, ['--name', '--version']);
    }

    override async execute(storage: Storage) {
        const token = await authenticated(storage);

        const name = this.parser.consumeOption('--name');

        if (this.parser.isOption('--version')) {
            const version = this.parser.consumeOption('--version');
            warning(name, version);
            await api.versions.delete.mutate({ token, project: name, version });
            console.log('Version deleted');
        } else {
            warning(name);
            await api.projects.delete.mutate({ token, name });
            console.log('Project deleted');
        }
    }
}
