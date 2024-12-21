import { BaseCommand } from './command.ts';
import { DeployCommand } from './commands/deploy.ts';
import { LoginCommand } from './commands/login.ts';
import { RegisterCommand } from './commands/register.ts';
import { Storage } from './storage.ts';

class HelpCommand extends BaseCommand {
    constructor(args: string[]) {
        super(args, []);
    }

    override async execute() {
        console.log('Commands:');
        for (const command in commands) {
            console.log(`> ${command}`);
        }
    }
}

const commands: { [key: string]: { new (args: string[]): BaseCommand } } = {
    help: HelpCommand,
    login: LoginCommand,
    register: RegisterCommand,
    deploy: DeployCommand,
};

async function main() {
    const argsCopy = Object.assign([], Deno.args);
    const subCommand = argsCopy.shift();

    if (subCommand == undefined) {
        throw new Error('No sub command specified');
    }

    const command = commands[subCommand];

    if (!command) {
        throw new Error(`Command ${subCommand} not found`);
    } else {
        const storage = new Storage();
        await new command(argsCopy).execute(storage);
    }
}

await main();
