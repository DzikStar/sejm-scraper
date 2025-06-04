import SejmScraper from 'core/sejm-scraper.js';
import logger from './utils/logger.js';

logger.info('Service task starting...');

try {
    const service = new SejmScraper();
    await service.run();

    logger.info('Service task completed successfully');
} catch (error) {
    logger.error({ err: error }, 'Failed to run service task');
    process.exit(1);
}
