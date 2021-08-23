import {
  MappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { UserEntity, GroupEntity } from '../jupiterone';

//example that matches: 'arn:aws:iam::123456789987:role/Great_Job123_For_Some-body'
const ARN_REGEX = /^arn:aws:iam::[0-9]+:role\/([a-zA-Z0-9-_]+)/;

export function convertAWSRolesToRelationships(
  oneLoginPrincipal: UserEntity | GroupEntity,
  roles: string[],
  relationshipType: string,
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
    }
  }
  return relationships;
}

/**
 * When an Onelogin application represents access to an AWS Account (the application
 * has a parameter of `parameters['https://aws.amazon.com/SAML/Attributes/Role'`),
 * the application parameter may have defined a property `awsRolesUserAttribute` that
 * contains a string of the user property, which itself has a semi-colon delimited string
 * of the Roles in AWS for this user. The roles are parsed to create mapped
 * relationships to the AWS IAM roles. The relationship is not created unless
 * the role is already in the graph.
 *
 * @param sourceKey the `_key` of the user which has access to the
 * `awsAccountId`
 * @param role the AWS IAM role identifier provided by Onelogin
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
