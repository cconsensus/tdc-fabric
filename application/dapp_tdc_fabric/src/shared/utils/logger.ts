import pino from 'pino';
import * as config from '../../config/config';

export const logger = pino({
  level: config.logLevel,
});
