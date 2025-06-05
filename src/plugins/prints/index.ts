import logger from 'utils/logger.js';
import { IPlugin } from 'plugins/base-plugin.js';
import * as fs from 'fs/promises';

export default class PrintsScraper implements IPlugin {
    public readonly name: string = 'Prints Scraper';
    public readonly description: string = 'Scrapes Parliment Prints from API.';

    constructor(private state: { currentTerm: number }) {}

    async run() {
        try {
            logger.info('Attempting to access /sejm/term:num/prints endpoint');
            const response = await fetch('https://api.sejm.gov.pl/sejm/term');
        } catch (error) {
            throw logger.error(error, "Couldn't access /sejm/term endpoint or save file");
        }
    }
}
