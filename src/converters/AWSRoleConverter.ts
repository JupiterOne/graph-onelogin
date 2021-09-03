import {
  IntegrationLogger,
  MappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { UserEntity, GroupEntity } from '../jupiterone';

//example that matches: 'arn:aws:iam::123456789987:role/Great_Job123_For_Some-body'
const ARN_REGEX = /^arn:aws:iam::[0-9]+:role\/([a-zA-Z0-9-_]+)/i;

export function convertAWSRolesToRelationships(
  oneLoginPrincipal: UserEntity | GroupEntity,
  roles: string[],
  relationshipType: string,
  logger: IntegrationLogger,
): MappedRelationship[] {
  const relationships: MappedRelationship[] = [];
  for (const role of roles) {
    const cleanRole = role.trim();
    if (ARN_REGEX.test(cleanRole)) {
      const relationship = mapAWSRoleAssignment({
        sourceKey: oneLoginPrincipal.id,
        roleArn: cleanRole,
        relationshipType,
      });
      if (relationship) {
        relationships.push(relationship);
      }
      logger.info(
        {
          sourceKey: oneLoginPrincipal.id,
          targetKey: cleanRole,
          relationshipKey: relationship?._key,
        },
        'Creating Mapped Relationship to Role',
      );
    }
  }
  return relationships;
}

/**
 * Given a source entity key (probably a User) and an AWN IAM Role ARN,
 * we can create a mapped relationship to that AWS IAM role. Mapped
 * relationships attempt to find the target entity in the J1 graph,
 * presumably from another integration having already created that entity.
 * Since we set skipTargetCreation to true here, the AWS IAM role entity
 * will not be created if it does not already exist in the graph.
 *
 * @param sourceKey the `_key` of the user which has access to the
 * `awsAccountId`
 * @param role the AWS IAM role identifier (ARN) provided by Onelogin
 * @param awsAccountId the application `awsAccountId`
 */
function mapAWSRoleAssignment({
  sourceKey,
  roleArn,
  relationshipType,
}: {
  sourceKey: string;
  roleArn: string;
  relationshipType: string;
}): MappedRelationship | undefined {
  const match = roleArn.match(ARN_REGEX);
  let role = '';
  if (match) {
    role = match[1]; //this will be the capture group of the regex (the part in parens)
  }
  return {
    _key: `${sourceKey}|assigned|${roleArn}`,
    _type: relationshipType,
    _class: 'ASSIGNED',
    _mapping: {
      sourceEntityKey: sourceKey,
      relationshipDirection: RelationshipDirection.REVERSE,
      targetFilterKeys: [['_type', '_key']],
      targetEntity: {
        _class: 'AccessRole',
        _type: 'aws_iam_role',
        _key: roleArn,
        roleName: role,
        name: role,
        displayName: role,
      },
      skipTargetCreation: true,
    },
    displayName: 'ASSIGNED',
  };
}
