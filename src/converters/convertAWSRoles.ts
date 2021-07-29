import {
  MappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { UserEntity, GroupEntity } from '../jupiterone';

export function convertAWSRolesToRelationships(
  oneLoginPrincipal: UserEntity | GroupEntity,
  roles: string[],
  relationshipType: string,
): MappedRelationship[] {
  const relationships: MappedRelationship[] = [];
  for (const role of roles) {
    if (!(role === '')) {
      const relationship = mapAWSRoleAssignment({
        sourceKey: oneLoginPrincipal.id,
        role,
        relationshipType,
        //the following was a line in the Okta integration, but we don't have awsAccountId in the OneLogin app. It's just used to name the relationship.
        //do we want something like that?
        awsAccountId: '999999', //this is not a thing. What do I want here?
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
  role,
  relationshipType,
  awsAccountId,
}: {
  sourceKey: string;
  role: string;
  relationshipType: string;
  awsAccountId: string;
}): MappedRelationship | undefined {
  const roleArn = `arn:aws:iam::${awsAccountId}:role/${role}`;
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
