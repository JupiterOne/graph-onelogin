import {
  convertProperties,
  parseTimePropertyValue,
  setRawData,
} from '@jupiterone/integration-sdk-core';
import {
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
  IdEntityMap,
  RoleEntity,
} from '../jupiterone';
import { User } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';

export function createUserEntity(
  user: User,
  roleByIdMap: IdEntityMap<RoleEntity>,
): UserEntity {
  let roles = '';
  if (user.role_id) {
    for (const roleId of user.role_id) {
      const role = roleByIdMap[roleId];
      if (role) {
        roles = roles + role.name + ',';
      }
    }
  }
  const userEntity: UserEntity = {
    _key: generateKey(USER_ENTITY_TYPE, user.id),
    _type: USER_ENTITY_TYPE,
    _class: USER_ENTITY_CLASS,
    id: String(user.id),
    displayName: `${user.firstname} ${user.lastname}`,
    name: `${user.firstname} ${user.lastname}`,
    activatedAt: parseTimePropertyValue(user.activated_at),
    createdAt: parseTimePropertyValue(user.created_at)!,
    email: user.email,
    username: user.username || '',
    firstname: user.firstname,
    groupId: String(user.group_id || ''), //group_id is null for users assigned to group "None"
    invalidLoginAttempts: user.invalid_login_attempts,
    invitationSentAt: parseTimePropertyValue(user.invitation_sent_at),
    lastLogin: parseTimePropertyValue(user.last_login),
    lastname: user.lastname,
    lockedUntil: user.locked_until,
    mfaEnabled: undefined, //property not currently supported by OneLogin, for future dev
    comment: user.comment || '',
    openidName: user.openid_name || '',
    localeCode: user.locale_code,
    preferredLocaleCode: user.preferred_locale_code,
    passwordChangedAt: parseTimePropertyValue(user.password_changed_at),
    phone: user.phone,
    status: String(user.status),
    updatedAt: parseTimePropertyValue(user.updated_at)!,
    distinguishedName: user.distinguished_name,
    externalId: user.external_id,
    directoryId: user.directory_id,
    memberOf: user.member_of || '', //member_of is null for users with no entry
    samaccountname: user.samaccountname,
    userprincipalname: user.userprincipalname,
    managerAdId: user.manager_ad_id,
    managerUserId: user.manager_user_id,
    company: user.company,
    department: user.department,
    title: user.title,
    state: user.state,
    trustedIdpId: user.trusted_idp_id,
    roles: roles,
    roleIds: user.role_id?.join(',') || '', //used later for checking rule conditions
    ...convertProperties(user.custom_attributes, {
      prefix: 'customAttributes', //used to be custom_attributes
    }),
  };

  // Raw data disabled due to very large size.
  setRawData(userEntity, { name: 'default', rawData: {} });
  return userEntity;
}
