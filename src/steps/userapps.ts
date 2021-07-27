import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createPersonalAppEntity } from '../converters';
import {
  UserEntity,
  AppEntity,
  IdEntityMap,
  PERSONAL_APP_ENTITY_TYPE,
  PERSONAL_APP_ENTITY_CLASS,
  USER_PERSONAL_APP_RELATIONSHIP_TYPE,
  USER_ENTITY_TYPE,
  USER_APP_RELATIONSHIP_TYPE,
  APP_ENTITY_TYPE,
} from '../jupiterone';

export async function fetchUserApps({
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

  const appByIdMap = await jobState.getData<IdEntityMap<AppEntity>>(
    'APPLICATION_BY_ID_MAP',
  );

  if (!appByIdMap) {
    throw new IntegrationMissingKeyError(
      `Expected to find appByIdMap in jobState.`,
    );
  }

  for (const userEntity of userEntities) {
    await apiClient.iterateUserApps(userEntity.id, async (userApp) => {
      if (appByIdMap[userApp.id]) {
        //in this case, it is an organization app
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: userEntity,
            to: appByIdMap[userApp.id],
          }),
        );
      }

      //documentation and experiments suggest that a user's personal apps
      //are not reported by the API, but just in case they are:
      if (!appByIdMap[userApp.id] && userApp.personal === true) {
        const personalAppEntity = await jobState.addEntity(
          createPersonalAppEntity(userApp),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: userEntity,
            to: personalAppEntity,
          }),
        );
      }
    });
  }
}

export const userAppSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-userapps',
    name: 'Fetch User Apps',
    entities: [
      {
        resourceName: 'Onelogin Personal Application',
        _type: PERSONAL_APP_ENTITY_TYPE,
        _class: PERSONAL_APP_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: USER_APP_RELATIONSHIP_TYPE,
        _class: RelationshipClass.ASSIGNED,
        sourceType: USER_ENTITY_TYPE,
        targetType: APP_ENTITY_TYPE,
      },
      {
        _type: USER_PERSONAL_APP_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: USER_ENTITY_TYPE,
        targetType: PERSONAL_APP_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-users', 'fetch-applications'],
    executionHandler: fetchUserApps,
  },
];
