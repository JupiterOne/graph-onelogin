import {
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
} from '../jupiterone';

import { Group } from '../onelogin/OneLoginClient';
import generateKey from '../utils/generateKey';

export function createGroupEntity(group: Group): GroupEntity {
  return {
    _class: GROUP_ENTITY_CLASS,
    _key: generateKey(GROUP_ENTITY_TYPE, group.id),
    _type: GROUP_ENTITY_TYPE,
    id: String(group.id),
    displayName: group.name,
    reference: group.reference,
    name: group.name,
  };
}
