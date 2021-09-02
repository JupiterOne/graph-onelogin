import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import { UserEntity } from '../jupiterone';
import { AppRule } from '../onelogin';
import findArns from './findArns';

const logger = createMockIntegrationLogger();

const testUser: UserEntity = {
  _key: 'onelogin_user_144476025',
  _type: 'onelogin_user',
  _class: ['User'],
  id: '144476025',
  displayName: 'Test User',
  name: 'Test User',
  activatedAt: 1628014445962,
  createdAt: 1628014445971,
  email: 'test.user@jupiterone.com',
  username: '',
  firstname: 'Test',
  groupId: '777888',
  invalidLoginAttempts: 0,
  invitationSentAt: 1628014471183,
  lastLogin: 1628014918006,
  lastname: 'User',
  lockedUntil: null,
  comment: '',
  openidName: 'test.user',
  localeCode: null,
  preferredLocaleCode: null,
  passwordChangedAt: 1628014881695,
  phone: '',
  status: 1,
  updatedAt: 1628014918111,
  distinguishedName: null,
  externalId: null,
  directoryId: null,
  memberOf: 'SECURITY_TEAM',
  samaccountname: null,
  userprincipalname: null,
  managerAdId: null,
  managerUserId: null,
  company: '',
  department: '',
  title: '',
  state: 1,
  trustedIdpId: null,
  roles: 'BigShot',
  roleIds: '459456,999999',
  'customAttributes.customUserField': '',
};

const defaultRuleWithArns: AppRule = {
  id: '12345677',
  name: 'Test Rule',
  match: 'any',
  enabled: true,
  position: 1,
  conditions: [
    {
      source: 'has_role',
      operator: 'ri',
      value: '459456', //matches a role id from test user
    },
  ],
  actions: [
    {
      action: 'set_role',
      value: [
        'arn:aws:iam::087679860675:role/OneLogin_EC2_ReadOnly',
        'arn:aws:iam::087679860675:role/OneLogin_S3_ReadOnly',
      ],
    },
  ],
};

const arnArray: string[] = [
  'arn:aws:iam::087679860675:role/OneLogin_EC2_ReadOnly',
  'arn:aws:iam::087679860675:role/OneLogin_S3_ReadOnly',
];

const emptyArray: string[] = [];

test('should return ARNs when there is a match using role includes', () => {
  expect(findArns(testUser, defaultRuleWithArns, logger)).toMatchObject(
    arnArray,
  );
});

test('should return ARNs when there is a match using role not includes', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'has_role',
      operator: 'rin',
      value: '333333', //does not match a role id from test user
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using group equals', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'group_id',
      operator: '=',
      value: '777888', //matches user's group id
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using group not equals', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'group_id',
      operator: '!=',
      value: '555444', //does not match user's group id
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using memberOf contains', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: '~',
      value: 'SECURITY', //matches user's memberOf
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using memberOf not contains', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: '!~',
      value: 'ALPHABET', //does not match user's memberOf
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using memberOf begins with', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: 'bw',
      value: 'SECURITY', //match beginning of user's memberOf
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using memberOf ends with', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: 'ew',
      value: 'TEAM', //match end of user's memberOf
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using memberOf equals', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: '=',
      value: 'SECURITY_TEAM', //match user's memberOf
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when there is a match using memberOf not equals', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: '!=',
      value: 'TEAM_SEC', //does not match user's memberOf
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return ARNs when match is any and not all match', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'member_of',
      operator: '~',
      value: 'SECURITY', //matches user's memberOf
    },
    {
      source: 'group_id',
      operator: '=',
      value: '0000', //does not match user's group id
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(arnArray);
});

test('should return empty array when match is all and not all match', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.match = 'all';
  rule.conditions = [
    {
      source: 'member_of',
      operator: '~',
      value: 'SECURITY', //matches user's memberOf
    },
    {
      source: 'group_id',
      operator: '=',
      value: '0000', //does not match user's group id
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(emptyArray);
});

test('should return empty array when rule not enabled', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.enabled = false;
  expect(findArns(testUser, rule, logger)).toMatchObject(emptyArray);
});

test('should return empty array when ARNs exist but no conditions match', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.conditions = [
    {
      source: 'has_role',
      operator: 'ri',
      value: '00000', //does not match user's role id
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(emptyArray);
});

test('should return empty array when match but no ARNs', () => {
  const rule = Object.create(defaultRuleWithArns) as AppRule;
  rule.actions = [
    {
      action: 'set_role',
      value: [], //ARNs are missing
    },
  ];
  expect(findArns(testUser, rule, logger)).toMatchObject(emptyArray);
});
