import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createPersonalDeviceEntity } from '../converters';
import {
  UserEntity,
  PERSONAL_DEVICE_ENTITY_TYPE,
  PERSONAL_DEVICE_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  USER_PERSONAL_DEVICE_RELATIONSHIP_TYPE,
} from '../jupiterone';

export async function fetchUserDevices({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const userEntities = await jobState.getData<UserEntity[]>('USER_ARRAY');

  if (!userEntities) {
    throw new IntegrationMissingKeyError(
      `Expected to find User entity array in jobState.`,
    );
  }

  const mfaDeviceKeySet = new Set<string>();
  const mfaDeviceRelationshipKeySet = new Set<string>();

  for (const userEntity of userEntities) {
    await apiClient.iterateUserDevices(userEntity.id, async (device) => {
      const rawDeviceEntity = createPersonalDeviceEntity(device);

      if (mfaDeviceKeySet.has(rawDeviceEntity._key)) {
        logger.info(
          {
            deviceKey: rawDeviceEntity._key,
            userEntityKey: userEntity._key,
          },
          'Duplicate device found. Skipping.',
        );
      } else {
        await jobState.addEntity(rawDeviceEntity);
      }

      mfaDeviceKeySet.add(rawDeviceEntity._key);

      const userDeviceRelationship = createDirectRelationship({
        _class: RelationshipClass.ASSIGNED,
        fromType: USER_ENTITY_TYPE,
        toType: PERSONAL_DEVICE_ENTITY_TYPE,
        fromKey: userEntity._key,
        toKey: rawDeviceEntity._key,
      });

      if (!mfaDeviceRelationshipKeySet.has(userDeviceRelationship._key)) {
        await jobState.addRelationship(userDeviceRelationship);
        mfaDeviceRelationshipKeySet.add(userDeviceRelationship._key);
      }
    });
  }
}

export const userDeviceSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-userdevices',
    name: 'Fetch User Devices',
    entities: [
      {
        resourceName: 'Onelogin Personal Device',
        _type: PERSONAL_DEVICE_ENTITY_TYPE,
        _class: PERSONAL_DEVICE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: USER_PERSONAL_DEVICE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.ASSIGNED,
        sourceType: USER_ENTITY_TYPE,
        targetType: PERSONAL_DEVICE_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-users'],
    executionHandler: fetchUserDevices,
  },
];
