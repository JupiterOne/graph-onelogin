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
import { createAppEntity, createAppRuleEntity } from '../converters';
import { DATA_ACCOUNT_ENTITY } from './account';
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_APP_RELATIONSHIP_TYPE,
  APP_RULE_RELATIONSHIP_TYPE,
  AppEntity,
  AppRuleEntity,
  APP_ENTITY_CLASS,
  APP_ENTITY_TYPE,
  APP_RULE_ENTITY_CLASS,
  APP_RULE_ENTITY_TYPE,
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
  const appEntityByIdMap = {};
  const ruleApiResponseByIdMap = {};

  await apiClient.iterateApplications(async (app) => {
    const applicationEntity = (await jobState.addEntity(
      createAppEntity(app),
    )) as AppEntity;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: applicationEntity,
      }),
    );

    if (app.rules) {
      for (const rule of app.rules) {
        ruleApiResponseByIdMap[rule.id] = rule; //storing the raw API response to preserve nested rule conditions and actions objects
        //TODO: remove temporary logging after learning the rules in use
        logger.info(
          { rule: rule, conditions: rule.conditions, actions: rule.actions },
          'Found OneLogin application rule',
        );
        const ruleEntity = (await jobState.addEntity(
          createAppRuleEntity(rule),
        )) as AppRuleEntity;
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: applicationEntity,
            to: ruleEntity,
          }),
        );
      }
    }

    appEntityByIdMap[app.id] = applicationEntity;
  });

  await jobState.setData('APPLICATION_BY_ID_MAP', appEntityByIdMap);
  await jobState.setData('APPLICATION_RULE_BY_ID_MAP', ruleApiResponseByIdMap);
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
      {
        resourceName: 'Onelogin Application Rule',
        _type: APP_RULE_ENTITY_TYPE,
        _class: APP_RULE_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _type: ACCOUNT_APP_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: ACCOUNT_ENTITY_TYPE,
        targetType: APP_ENTITY_TYPE,
      },
      {
        _type: APP_RULE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.HAS,
        sourceType: APP_ENTITY_TYPE,
        targetType: APP_RULE_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchApplications,
  },
];
