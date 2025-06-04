import logger from 'utils/logger.js';
import { config } from 'core/config.js';
import { Github } from 'services/github.js';
import TermsInit from 'plugins/terms-init/index.js';
import { IPlugin } from 'plugins/base-plugin.js';

export default class SejmScraper {
    private plugins: IPlugin[] = [];
    private github = new Github();
    state = { currentTerm: 0 };

    public async run() {
        logger.info('Initializing plugins');
        try {
            this.registerPlugin(new TermsInit(this.state));
        } catch (error) {
            logger.error({ err: error }, 'Error while initializing plugins');
        }

        await this.github.clone(config.git.repository.output);

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

        if (config.deploy_on_github) {
            this.github.commit('Updated sejm.gov.pl mirror', config.git.repository.output);
        }
    }

    private registerPlugin(plugin: IPlugin) {
        this.plugins.push(plugin);
        logger.info(
            {
                pluginName: plugin.name,
                description: plugin.description,
            },
            'Registered plugin',
        );
    }
}
