import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino.default({
    level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
              },
          }
        : undefined,
});

export default logger;
