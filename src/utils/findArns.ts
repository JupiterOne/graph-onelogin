import { User } from '../onelogin';

export default function findArns(user: User): string[] {
  //the goal is to scan a raw API User response for arns and return them in an array
  //example that matches: 'arn:aws:iam::123456789987:role/Great_Job123_For_Some-body'
  const ARN_REGEX = /arn:aws:iam::[0-9]+:role\/([a-zA-Z0-9-_]+)/gi;
  const match_array = JSON.stringify(user).match(ARN_REGEX); //should find every ARN
  if (match_array) {
    return match_array;
  } else {
    return [];
  }
}
