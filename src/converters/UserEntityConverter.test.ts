import { User } from '../onelogin/OneLoginClient';
import { createUserEntity } from './UserEntityConverter';

const baseUser: User = {
  created_at: new Date().toString(),
  email: 'fake.email@fake.domain.com',
  firstname: 'John',
  lastname: 'Smith',
  group_id: 1,
  id: 1,
  openid_name: 'john-smith',
  status: 0,
  updated_at: new Date().toString(),
  role_id: [1],
  state: 0,
  activated_at: null,
  username: null,
  invalid_login_attempts: null,
  invitation_sent_at: null,
  last_login: null,
  locked_until: null,
  comment: null,
  locale_code: null,
  preferred_locale_code: null,
  password_changed_at: null,
  phone: null,
  distinguished_name: null,
  external_id: null,
  directory_id: null,
  member_of: null,
  samaccountname: null,
  userprincipalname: null,
  manager_ad_id: null,
  manager_user_id: null,
  company: null,
  department: null,
  title: null,
  trusted_idp_id: null,
};

test('should convert custom attributes', () => {
  const user: User = {
    ...baseUser,
    custom_attributes: {
      customUserField: 'custom-user-value',
      anotherField: 'another-value',
    },
  };

  expect(createUserEntity(user)).toMatchObject({
    'customAttributes.customUserField': 'custom-user-value',
    'customAttributes.anotherField': 'another-value',
  });
});
