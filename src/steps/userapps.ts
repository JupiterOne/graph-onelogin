import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  IntegrationMissingKeyError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import {
  createPersonalAppEntity,
  convertAWSRolesToRelationships,
} from '../converters';
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
  USER_AWS_IAM_ROLE_RELATIONSHIP_TYPE,
  AWS_IAM_ROLE_ENTITY_TYPE,
} from '../jupiterone';
import { AppRule } from '../onelogin';
import findArns from '../utils/findArns';

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
      `Expected applications.ts to have saved appByIdMap in jobState.`,
    );
  }

  const appRuleByIdMap = await jobState.getData<IdEntityMap<AppRule>>(
    'APPLICATION_RULE_BY_ID_MAP',
  );

  if (!appRuleByIdMap) {
    throw new IntegrationMissingKeyError(
      `Expected applications.ts to have saved appRuleByIdMap in jobState.`,
    );
  }

  //temporary code to ensure feature is working
  let numberOfAwsIamRels = 0;
  let numberOfArns = 0;

  for (const userEntity of userEntities) {
    await apiClient.iterateUserApps(userEntity.id, async (userApp) => {
      const appEntity = appByIdMap[userApp.id];
      if (appEntity) {
        //in this case, it is an organization app
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: userEntity,
            to: appEntity,
          }),
        );
        //check on potential rules mapping this user to IAM accounts
        if (appEntity.ruleIds) {
          const ruleIds = appEntity.ruleIds.split(',');
          for (const ruleId of ruleIds) {
            try {
              //just in case this code goes awry, don't bomb the step
              const awsArns: string[] = findArns(
                userEntity,
                appRuleByIdMap[ruleId],
              );
              if (awsArns) {
                numberOfArns = numberOfArns + awsArns.length;
                const awsRelationships = convertAWSRolesToRelationships(
                  userEntity,
                  awsArns,
                  USER_AWS_IAM_ROLE_RELATIONSHIP_TYPE,
                );
                for (const rel of awsRelationships) {
                  if (!jobState.hasKey(rel._key)) {
                    //TODO: for now, don't actually add the rel until we've refined rule condition parsing
                    //await jobState.addRelationship(rel);
                    numberOfAwsIamRels = numberOfAwsIamRels + 1;
                  }
                }
              }
            } catch (err) {
              logger.info(
                { err, userId: userEntity.id },
                'Unable to build relationships between OneLogin user and AWS Roles',
              );
            }
          }
        }
      } else {
        //documentation and experiments suggest that a user's personal apps
        //are not reported by the API, but just in case they are:
        if (userApp.personal === true) {
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
      }
    });
  }
  logger.info(
    {
      userCount: userEntities.length,
      arnCount: numberOfArns,
      iamRoleRelationshipCount: numberOfAwsIamRels,
    },
    'Completed OneLogin user to AWS Role processing',
  );
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
      {
        _type: USER_AWS_IAM_ROLE_RELATIONSHIP_TYPE,
        _class: RelationshipClass.ASSIGNED,
        sourceType: USER_ENTITY_TYPE,
        targetType: AWS_IAM_ROLE_ENTITY_TYPE,
      },
    ],
    dependsOn: ['fetch-users', 'fetch-applications'],
    executionHandler: fetchUserApps,
  },
];
