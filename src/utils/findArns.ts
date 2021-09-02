import { UserEntity } from '../jupiterone';
import { AppRule, AppRuleAction, AppRuleCondition } from '../onelogin';

export default function findArns(user: UserEntity, rule: AppRule): string[] {
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

  if (rule.match === 'any') {
    const conditionsMet: boolean[] = rule.conditions.map((c) =>
      checkConditionForUser(c, user),
    );
    if (conditionsMet.includes(true)) {
      return extractArns(rule.actions);
    } else {
      return [];
    }
  } else {
    //default assume all conditions have to match
    for (const c of rule.conditions) {
      if (!checkConditionForUser(c, user)) {
        return []; //fail fast
      }
    }
    return extractArns(rule.actions);
  }
}

function checkConditionForUser(
  cond: AppRuleCondition,
  user: UserEntity,
): boolean {
  return true;
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
