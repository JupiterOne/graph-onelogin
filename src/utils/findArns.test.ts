import findArns from './findArns';

test('should return empty array when no ARNs', () => {
  const userWithoutArns = {
    activated_at: '2021-08-03T18:14:05.962Z',
    created_at: '2021-08-03T18:14:05.971Z',
    email: 'adam.williams@jupiterone.com',
    username: '',
    firstname: 'Adam',
    group_id: 0,
    id: 144476025,
    invalid_login_attempts: 0,
    invitation_sent_at: '2021-08-03T18:14:31.183Z',
    last_login: '2021-08-03T18:21:58.006Z',
    lastname: 'Williams',
    locked_until: null,
    comment: '',
    openid_name: 'adam.williams',
    locale_code: null,
    preferred_locale_code: null,
    password_changed_at: '2021-08-03T18:21:21.695Z',
    phone: '',
    status: 1,
    updated_at: '2021-08-03T18:21:58.111Z',
    distinguished_name: null,
    external_id: null,
    directory_id: null,
    member_of: null,
    samaccountname: null,
    userprincipalname: null,
    manager_ad_id: null,
    manager_user_id: null,
    role_id: [],
    company: '',
    department: '',
    title: '',
    state: 1,
    trusted_idp_id: null,
    custom_attributes: { customUserField: '', SuperLongAWSRoleArn: '' },
  };
  const emptyArray: string[] = [];
  expect(findArns(userWithoutArns)).toMatchObject(emptyArray);
});

test('should return ARNs', () => {
  const userWithArns = {
    activated_at: '2021-06-16T18:00:37.300Z',
    created_at: '2021-06-16T18:00:37.485Z',
    email: 'thomaskevincasey74@gmail.com',
    username: '',
    firstname: 'Kevin',
    group_id: 477661,
    id: 137729105,
    invalid_login_attempts: 0,
    invitation_sent_at: '2021-06-16T18:00:52.170Z',
    last_login: '2021-08-25T01:56:17.518Z',
    lastname: 'Casey',
    locked_until: null,
    comment: '',
    openid_name: 'thomaskevincasey74',
    locale_code: null,
    preferred_locale_code: null,
    password_changed_at: '2021-07-27T16:38:34.419Z',
    phone: '',
    status: 1,
    updated_at: '2021-08-25T01:56:17.821Z',
    distinguished_name: null,
    external_id: null,
    directory_id: null,
    member_of: null,
    samaccountname: null,
    userprincipalname: null,
    manager_ad_id: null,
    manager_user_id: null,
    role_id: [439869, 439870],
    company: '',
    department: '',
    title: '',
    state: 1,
    trusted_idp_id: null,
    amazon_roles:
      'arn:aws:iam::123456789987:role/Ninja; arn:aws:iam::123456789987:role/Developer',
  };
  const arnArray: string[] = [
    'arn:aws:iam::123456789987:role/Ninja',
    'arn:aws:iam::123456789987:role/Developer',
  ];
  expect(findArns(userWithArns)).toMatchObject(arnArray);
});

test('should return ARNs in custom attributes', () => {
  const userWithCustomAttributeArns = {
    activated_at: '2021-06-16T18:00:37.300Z',
    created_at: '2021-06-16T18:00:37.485Z',
    email: 'thomaskevincasey74@gmail.com',
    username: '',
    firstname: 'Kevin',
    group_id: 477661,
    id: 137729105,
    invalid_login_attempts: 0,
    invitation_sent_at: '2021-06-16T18:00:52.170Z',
    last_login: '2021-08-25T01:56:17.518Z',
    lastname: 'Casey',
    locked_until: null,
    comment: '',
    openid_name: 'thomaskevincasey74',
    locale_code: null,
    preferred_locale_code: null,
    password_changed_at: '2021-07-27T16:38:34.419Z',
    phone: '',
    status: 1,
    updated_at: '2021-08-25T01:56:17.821Z',
    distinguished_name: null,
    external_id: null,
    directory_id: null,
    member_of: null,
    samaccountname: null,
    userprincipalname: null,
    manager_ad_id: null,
    manager_user_id: null,
    role_id: [439869, 439870],
    company: '',
    department: '',
    title: '',
    state: 1,
    trusted_idp_id: null,
    custom_attributes: {
      customUserField: 'AWSRole',
      SuperLongAWSRoleArn:
        'arn:aws:iam::123456789987:role/Ninja, arn:aws:iam::123456789987:role/Developer',
    },
  };
  const arnArray: string[] = [
    'arn:aws:iam::123456789987:role/Ninja',
    'arn:aws:iam::123456789987:role/Developer',
  ];
  expect(findArns(userWithCustomAttributeArns)).toMatchObject(arnArray);
});
