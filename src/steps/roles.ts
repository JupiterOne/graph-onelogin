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
import { createRoleEntity } from '../converters';
import { DATA_ACCOUNT_ENTITY } from './account';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_ROLE_RELATIONSHIP_TYPE,
  RoleEntity,
  ROLE_ENTITY_CLASS,
  ROLE_ENTITY_TYPE,
} from '../jupiterone';

export async function fetchRoles({
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
  const roleByIdMap = {};

  await apiClient.iterateRoles(async (role) => {
    const roleEntity = (await jobState.addEntity(
      createRoleEntity(role),
    )) as RoleEntity;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: roleEntity,
      }),
    );

    roleByIdMap[role.id] = roleEntity;
  });

  await jobState.setData('ROLE_BY_ID_MAP', roleByIdMap);
}

export const roleSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-roles',
    name: 'Fetch Roles',
    entities: [
      {
        resourceName: 'Onelogin Role',
        _type: ROLE_ENTITY_TYPE,
        _class: ROLE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_ROLE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: ROLE_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchRoles,
  },
];
