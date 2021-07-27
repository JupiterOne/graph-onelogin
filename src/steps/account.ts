import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../config';
import { createAccountEntity, getServiceEntities } from '../converters';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_ENTITY_CLASS,
  SERVICE_ENTITY_CLASS,
  SERVICE_ENTITY_TYPE,
  ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
} from '../jupiterone';

export const DATA_ACCOUNT_ENTITY = 'DATA_ACCOUNT_ENTITY';

export async function fetchAccountDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const account = {
    id: instance.id,
    name: instance.name,
    orgUrl: instance.config.orgUrl,
  };
  const accountEntity = await jobState.addEntity(createAccountEntity(account));
  await jobState.setData(DATA_ACCOUNT_ENTITY, accountEntity);

  const serviceEntities = await jobState.addEntities(
    getServiceEntities(account.name),
  );
  for (const serviceEntity of serviceEntities) {
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: serviceEntity,
      }),
    );
  }
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    entities: [
      {
        resourceName: 'Onelogin Account',
        _type: ACCOUNT_ENTITY_TYPE,
        _class: ACCOUNT_ENTITY_CLASS,
      },
      {
        resourceName: 'Onelogin Service',
        _type: SERVICE_ENTITY_TYPE,
        _class: SERVICE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: SERVICE_ENTITY_TYPE,
      },
    ],
    dependsOn: [],
    executionHandler: fetchAccountDetails,
  },
];
