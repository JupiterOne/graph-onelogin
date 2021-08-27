import {
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
} from '../jupiterone';

import { Group } from '../onelogin/OneLoginClient';
import generateKey from '../utils/generateKey';
import { setRawData } from '@jupiterone/integration-sdk-core';

export function createGroupEntity(group: Group): GroupEntity {
  const groupEntity: GroupEntity = {
    _class: GROUP_ENTITY_CLASS,
    _key: generateKey(GROUP_ENTITY_TYPE, group.id),
    _type: GROUP_ENTITY_TYPE,
    id: String(group.id),
    displayName: group.name,
    reference: group.reference,
    name: group.name,
  };
  setRawData(groupEntity, { name: 'default', rawData: group });
  return groupEntity;
}
