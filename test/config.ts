import * as dotenv from 'dotenv';
import * as path from 'path';

import { IntegrationConfig } from '../src/config';

/**
 * Recording tests require valid credentials loaded from `.env`. Record new tests as follows:
 *
 * > LOAD_ENV=1 yarn test
 */
if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const integrationConfig: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  //orgUrl is used for the weblink property of the account entity
  //to make the entity snapshot match in testing, don't use process.env.orgUrl
  orgUrl: 'https://orgUrl.com',
};
