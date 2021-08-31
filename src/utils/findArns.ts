import { UserEntity } from '../jupiterone';
import { AppRule } from '../onelogin';

export default function findArns(user: UserEntity, rule: AppRule): string[] {
  //the goal is to compare the conditions and actions for a raw API Application Rule
  //and compare those conditions and actions to see if a user has an AWS IAM Role assigned
  //that condition/action language has a lot of options

  //for now, assume all users on the app have the IAM role
  //this will have to get a lot more sophisticated later
  //especially if we find that users can also get ARNs from user attribute in addition to rule maps

  //example of an ARN that matches the regex: 'arn:aws:iam::123456789987:role/Great_Job123_For_Some-body'
  //the regex is case insensitive due to the /i flag at the end
  const ARN_REGEX = /arn:aws:iam::[0-9]+:role\/([a-zA-Z0-9-_]+)/gi;
  const match_array = JSON.stringify(rule).match(ARN_REGEX); //should find every ARN
  if (match_array) {
    return match_array;
  } else {
    return [];
  }
}
