import { ROLE_ENTITY_CLASS, ROLE_ENTITY_TYPE, RoleEntity } from '../jupiterone';
import { Role } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';

export function createRoleEntity(role: Role): RoleEntity {
  return {
    _class: ROLE_ENTITY_CLASS,
    _key: generateKey(ROLE_ENTITY_TYPE, role.id),
    _type: ROLE_ENTITY_TYPE,
    id: String(role.id),
    displayName: role.name,
    name: role.name,
  };
}
