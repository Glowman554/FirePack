import { ArgParser } from './parser.ts';
import { Storage } from './storage.ts';

export class BaseCommand {
    _parser: ArgParser | null;

    constructor(args: string[], allowedArgs: string[] | undefined) {
        if (allowedArgs) {
            this._parser = new ArgParser(args, allowedArgs);
            this._parser.parse();
        } else {
            this._parser = null;
        }
    }

    get parser() {
        if (!this._parser) {
            throw new Error('Parser is not initialized');
        }
        return this._parser;
    }

    execute(storage: Storage): Promise<void> {
        throw new Error('execute() not implemented');
    }
}
