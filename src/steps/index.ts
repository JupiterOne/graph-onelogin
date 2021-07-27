import { accountSteps } from './account';
import { applicationSteps } from './applications';
import { groupSteps } from './groups';
import { roleSteps } from './roles';
import { userAppSteps } from './userapps';
import { userDeviceSteps } from './userdevices';
import { userSteps } from './users';

const integrationSteps = [
  ...accountSteps,
  ...groupSteps,
  ...roleSteps,
  ...userSteps,
  ...applicationSteps,
  ...userAppSteps,
  ...userDeviceSteps,
];

export { integrationSteps };
