import logger from 'utils/logger.js';
import { IPlugin } from 'plugins/base-plugin.js';

export default class ExamplePlugin implements IPlugin {
    public readonly name: string = 'Example';
    public readonly description: string = 'Does A thing and B thing';

    async run() {
        logger.warn('test');
        return;
    }
}
