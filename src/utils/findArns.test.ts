import findArns from './findArns';

const testUser = {
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
  groupId: '0',
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
  memberOf: null,
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
  roleIds: '459456',
  'customAttributes.customUserField': '',
};

test('should return empty array when match but no ARNs', () => {
  const ruleWithNoArns = {
    id: '12345677',
    name: 'Test Rule',
    match: '1',
    enabled: true,
    position: 1,
    conditions: [
      {
        source: 'has_role',
        operator: 'ri',
        value: '459456',
      },
    ],
    actions: [
      {
        action: 'set_role',
        value: [],
      },
    ],
  };
  const emptyArray: string[] = [];
  expect(findArns(testUser, ruleWithNoArns)).toMatchObject(emptyArray);
});

test('should return ARNs', () => {
  const ruleWithArns = {
    id: '12345677',
    name: 'Test Rule',
    match: '1',
    enabled: true,
    position: 1,
    conditions: [
      {
        source: 'has_role',
        operator: 'ri',
        value: '459456',
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
  expect(findArns(testUser, ruleWithArns)).toMatchObject(arnArray);
});
