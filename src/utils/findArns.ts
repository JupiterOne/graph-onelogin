import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import { UserEntity } from '../jupiterone';
import { AppRule, AppRuleAction, AppRuleCondition } from '../onelogin';

export default function findArns(
  user: UserEntity,
  rule: AppRule,
  logger: IntegrationLogger,
): string[] {
  /**
   * The goal is to find any AWS IAM Role ARNs assigned to this user
   * Return array of ARNs as strings if conditions apply and ARNs found
   * Return empty array if conditions don't apply or no ARNs found
   *
   * The best practice approach in setting up OneLogin SSO to AWS is
   * to create a Rule in the OneLogin Application which sets the AWS Role
   * based on user properties. Theoretically, one could also store the ARNs
   * directly as User properties, but that does not appear to be common practice
   *
   * Assuming a Rule is being used, the goal is to compare the conditions for a
   * raw API Application Rule to the user's properties, and then see whether an AWS
   * IAM Role is assigned. Conditions have many possible `source` and `operator` values,
   * of which we support a subset.
   *
   * examples of supported conditions:
   * conditions: [
   *   {
   *     "source": "member_of", // refers to an Active Directory security group name
   *     "operator": "~", // means "contains"
   *     "value": "SECURITY_TEAM"
   *   },
   *   {
   *     "source": "has_role", // refers to a OneLogin Role
   *     "operator": "ri",
   *     "value": "459456"
   *   },
   *   {
   *     "source": "group_id", // refers to a OneLogin Group
   *     "operator": "=",
   *     "value": "477661"
   *   }
   * ]
   *
   * Rule property `match` will be either `any` or `all`, which determines whether
   * the action is triggered if the user matches any or all of the conditions
   *
   * example of supported action:
   * actions: [
   *   {
   *     "action": "set_role", // sets the SAML Role attribute for the OneLogin Application
   *     "value": [
   *       "arn:aws:iam::087679860675:role/OneLogin_EC2_ReadOnly",
   *       "arn:aws:iam::087679860675:role/OneLogin_S3_ReadOnly"
   *     ]
   *   }
   * ]
   */

  if (rule.enabled) {
    if (rule.match === 'any') {
      for (const c of rule.conditions) {
        if (checkConditionForUser(c, user, logger)) {
          return extractArns(rule.actions); //succeed fast
        }
      }
      return []; //you never succeeded, so you fail
    } else {
      //default assume all conditions have to match
      for (const c of rule.conditions) {
        if (!checkConditionForUser(c, user, logger)) {
          return []; //fail fast
        }
      }
      return extractArns(rule.actions); //you never failed, so you succeed
    }
  }
  return [];
}

function checkConditionForUser(
  cond: AppRuleCondition,
  user: UserEntity,
  logger: IntegrationLogger,
): boolean {
  const condValue = cond.value || ''; //generally, the UI prevents condValue from being null or undefined, but just in case
  if (cond.source === 'member_of') {
    // refers to Active Directory security group. cond.value is a freeform string
    // member_of for a user from the API is null for user with info in that field
    // user.memberOf from UserEntityConverter should be '' in that case
    // the UI will allow cond.value to be ''
    const memberOf = user.memberOf || '';
    switch (cond.operator) {
      case '=': // "equal"
        return user.memberOf === condValue;
      case '!=': // "not equal"
        return user.memberOf !== condValue;
      case '~': // "contains"
        return memberOf.includes(condValue);
      case '!~': // "not contains"
        return !memberOf.includes(condValue);
      case 'bw': // "begins with"
        return memberOf.startsWith(condValue);
      case 'ew': // "ends with"
        return memberOf.endsWith(condValue);
      default:
        logger.info(
          { cond },
          `findArns.ts did not recognize operator "${cond.operator}" in application rule condition source "${cond.source}"`,
        );
        return false;
    }
  }
  if (cond.source === 'has_role') {
    // refers to OneLogin Role. Users can have multiple roles. cond.value is a single role id
    // users with no assigned roles still have the Default role, which has a role id
    // theoretically, there should be no way for roleIds to be empty
    // the OneLogin UI for Rule conditions also forces picking a role (at least Default, which
    // still has an ID number), so there should be no way for cond.value to be empty
    const roleIds = user.roleIds ? user.roleIds.split(',') : [];
    switch (cond.operator) {
      case 'ri': // "roles include"
        return roleIds.includes(condValue);
      case 'rin': // "roles include NOT"
        return !roleIds.includes(condValue);
      default:
        logger.info(
          { cond },
          `findArns.ts did not recognize operator "${cond.operator}" in application rule condition source "${cond.source}"`,
        );
        return false;
    }
  }
  if (cond.source === 'group_id') {
    // refers to OneLogin Group. Users can only be in one group. cond.value is a single group id
    // group_id for a user from the API is null for user assigned to OneLogin Group 'None'
    // user.groupId from UserEntityConverter should be '' in that case
    // cond.value is '' if the group field in the Rule conditions UI is set to 'None'
    switch (cond.operator) {
      case '=':
        return user.groupId === condValue;
      case '!=':
        return user.groupId !== condValue;
      default:
        logger.info(
          { cond },
          `findArns.ts did not recognize operator "${cond.operator}" in application rule condition source "${cond.source}"`,
        );
        return false;
    }
  }
  logger.info(
    { cond },
    `findArns.ts failed did not recognize application rule condition source "${cond.source}"`,
  );
  return false;
}

function extractArns(ruleActions: AppRuleAction[]): string[] {
  //example of an ARN that matches the regex: 'arn:aws:iam::123456789987:role/Great_Job123_For_Some-body'
  //the regex is case insensitive due to the /i flag at the end
  const ARN_REGEX = /arn:aws:iam::[0-9]+:role\/([a-zA-Z0-9-_]+)/gi;
  //currently not checking on action type for `set_role` in case SAML parameter names vary a bit in different apps
  const match_array = JSON.stringify(ruleActions).match(ARN_REGEX); //should find every ARN
  if (match_array) {
    return match_array;
  } else {
    return [];
  }
}
