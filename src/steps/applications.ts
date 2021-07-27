import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { createAppEntity } from '../converters';
import { DATA_ACCOUNT_ENTITY } from './account';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_APP_RELATIONSHIP_TYPE,
  RoleEntity,
  APP_ENTITY_CLASS,
  APP_ENTITY_TYPE,
} from '../jupiterone';

export async function fetchApplications({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config, logger);

  const accountEntity = (await jobState.getData(DATA_ACCOUNT_ENTITY)) as Entity;

  if (!accountEntity) {
    throw new IntegrationMissingKeyError(
      `Expected to find Account entity in jobState.`,
    );
  }

  //for use later in other steps
  const appByIdMap = {};

  await apiClient.iterateApplications(async (app) => {
    const applicationEntity = (await jobState.addEntity(
      createAppEntity(app),
    )) as RoleEntity;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: applicationEntity,
      }),
    );

    appByIdMap[app.id] = applicationEntity;
  });

  await jobState.setData('APPLICATION_BY_ID_MAP', appByIdMap);
}

export const applicationSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-applications',
    name: 'Fetch Applications',
    entities: [
      {
        resourceName: 'Onelogin Application',
        _type: APP_ENTITY_TYPE,
        _class: APP_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_APP_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: APP_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchApplications,
  },
];
