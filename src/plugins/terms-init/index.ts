import { config } from 'core/config.js';
import logger from 'utils/logger.js';
import { IPlugin } from 'plugins/base-plugin.js';
import * as fs from 'fs/promises';

interface Term {
    current: boolean;
    from: string;
    num: number;
    prints: TermPrints;
    to?: string;
}

interface TermPrints {
    count: number;
    lastChanged?: string;
    link: string;
}

export default class TermsScraper implements IPlugin {
    public readonly name: string = 'Terms Scraper';
    public readonly description: string = 'Scrapes Parliment Terms data from API.';

    constructor(private state: { currentTerm: number }) {}

    async run() {
        try {
            logger.info('Attempting to access /sejm/term endpoint');
            const response = await fetch('https://api.sejm.gov.pl/sejm/term');
            const terms: Term[] = await response.json();
            this.state.currentTerm = terms.length;
            logger.debug({ 'Terms Count': terms.length }, 'Successfully fetched /sejm/term endpoint');

            for (const term of terms) {
                await this.saveTerm(term.num, term);
            }
        } catch (error) {
            throw logger.error(error, "Couldn't access /sejm/term endpoint or save file");
        }
    }

    async saveTerm(termId: number, termContent: Term) {
        const filePath = `./${config.git.repository.output}/term${termId}`;
        const fileName = '/term.json';

        await fs.mkdir(filePath, { recursive: true });
        logger.info({ filePath }, 'Prepared path for Term');

        await fs.writeFile(filePath + fileName, JSON.stringify(termContent, null, 4));
        logger.info(
            {
                filePath,
                fileName,
            },
            'Saved term result',
        );
    }
}
