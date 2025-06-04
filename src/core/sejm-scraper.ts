import logger from 'utils/logger.js';
import ExamplePlugin from 'plugins/example/index.js';
import { IPlugin } from 'plugins/base-plugin.js';

export default class SejmScraper {
    private plugins: IPlugin[] = [];

    public async run() {
        logger.info('Initializing plugins');
        try {
            this.registerPlugin(new ExamplePlugin());
        } catch (error) {
            logger.error({ err: error }, 'Error while initializing plugins');
        }

        for (const plugin of this.plugins) {
            try {
                logger.info('Starting plugin execution');
                await plugin.run();
                logger.info('Finished plugin execution successfully');
            } catch (error) {
                logger.error({ err: error }, 'Plugin execution failed');
                throw error;
            }
        }
    }

    private registerPlugin(plugin: IPlugin) {
        this.plugins.push(plugin);
        logger.info({ pluginName: plugin.name, description: plugin.description }, 'Registered plugin');
    }
}
