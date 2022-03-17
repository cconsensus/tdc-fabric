import * as config from './config';

export default {
  jwt: {
    secret: config.appSecret,
    expiresIn: '1d',
  },
};
