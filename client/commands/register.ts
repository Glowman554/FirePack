import { api } from '../api.ts';
import { BaseCommand } from '../command.ts';
import { Storage } from '../storage.ts';

export class RegisterCommand extends BaseCommand {
    constructor(args: string[]) {
        super(args, ['--username', '--password']);
    }

    override async execute(storage: Storage) {
        const username = this.parser.consumeOption('--username');
        const password = this.parser.consumeOption('--password');

        const token = await api.authentication.register.mutate({ username, password });
        storage.set('token', token);

        console.log('Registered successfully');
    }
}
