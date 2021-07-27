import {
  convertProperties,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { USER_ENTITY_CLASS, USER_ENTITY_TYPE, UserEntity } from '../jupiterone';
import { User } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';

export function createUserEntity(user: User): UserEntity {
  return {
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
    groupId: user.group_id || 0,
    invalidLoginAttempts: user.invalid_login_attempts,
    invitationSentAt: parseTimePropertyValue(user.invitation_sent_at),
    lastLogin: parseTimePropertyValue(user.last_login),
    lastname: user.lastname,
    lockedUntil: user.locked_until,
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
    memberOf: user.member_of,
    samaccountname: user.samaccountname,
    userprincipalname: user.userprincipalname,
    managerAdId: user.manager_ad_id,
    managerUserId: user.manager_user_id,
    company: user.company,
    department: user.department,
    title: user.title,
    state: user.state,
    trustedIdpId: user.trusted_idp_id,
    ...convertProperties(user.custom_attributes, {
      prefix: 'customAttributes', //used to be custom_attributes
    }),
  };
}
