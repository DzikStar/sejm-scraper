import { config } from 'core/config.js';
import logger from 'utils/logger.js';
import { IPlugin } from 'plugins/base-plugin.js';
import * as fs from 'fs/promises';

interface Print {
    attachments?: string[];
    changeDate?: string;
    deliveryDate: string;
    documentDate: string;
    number: string;
    processPrint: string[];
    term: number;
    title: string;
}

export default class PrintsScraper implements IPlugin {
    public readonly name: string = 'Prints Scraper';
    public readonly description: string = 'Scrapes Parliment Prints from API.';

    constructor(private state: { currentTerm: number }) {}

    async run() {
        for (let termNum = 1; termNum <= this.state.currentTerm; termNum++) {
            const response = await fetch(`https://api.sejm.gov.pl/sejm/term${termNum}/prints`);
            const prints = await response.json();
            logger.info(
                {
                    termNum: termNum,
                    'Prints count': prints.length,
                },
                'Fetched selected term prints',
            );

            const filePath = `./${config.git.repository.output}/term${termNum}/prints`;
            logger.debug({ filePath, termNum }, 'Preparing path for term prints');
            await fs.mkdir(filePath, { recursive: true });
            logger.info({ filePath, termNum }, 'Generated path for term prints');

            const fileName = '/prints.json';
            logger.debug({ filePath, fileName, termNum }, 'Trying to save prints data of term');
            await fs.writeFile(filePath + fileName, JSON.stringify(prints, null, 4));
            logger.info({ filePath, fileName, termNum }, 'Saved prints data of term');

            for (const print of prints) {
                try {
                    logger.debug({ printNumber: print.number }, 'Attempting to save print');
                    await this.savePrint(print);
                    logger.info({ printNumber: print.number }, 'Print saved');
                } catch (error) {
                    logger.error({ print, error }, 'Error occured during print scrape');
                    continue;
                }
            }
        }
    }

    async savePrint(print: Print): Promise<void> {
        const filePath = `./${config.git.repository.output}/term${print.term}/prints/${print.number}`;

        logger.debug({ filePath, printNumber: print.number }, 'Preparing path for print contents');
        await fs.mkdir(filePath, { recursive: true });
        logger.info({ filePath, printNumber: print.number }, 'Generated path for print contents');

        if (print.attachments && print.attachments.length > 0) {
            for (const file of print.attachments) {
                const requestUrl = `https://api.sejm.gov.pl/sejm/term${print.term}/prints/${print.number}/${file}`;
                const response = await fetch(requestUrl);
                if (!response.ok) {
                    logger.error({ requestUrl, filePath, printNumber: print.number, file, status: response.status }, 'Failed to fetch file content');
                    continue;
                }
                const fileContent = await response.arrayBuffer();

                logger.debug({ filePath, printNumber: print.number, file }, 'Preparing path for print contents');
                await fs.writeFile(`${filePath}/${file}`, Buffer.from(fileContent));
                logger.info({ filePath, printNumber: print.number, file }, 'Generated path for print contents');
            }
        }
    }
}
