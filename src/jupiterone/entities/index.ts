export * from './GroupEntity';
export * from './UserEntity';
export * from './RoleEntity';
export * from './AccountEntity';
export * from './AppEntity';
export * from './ServiceEntity';
export * from './PersonalAppEntity';
export * from './PersonalDeviceEntity';
export * from './UserGroupRelationship';
export * from './UserRoleRelationship';
export * from './UserAppRelationship';
export * from './UserPersonalAppRelationship';
export * from './UserPersonalDeviceRelationship';
export * from './AccountAppRelationship';
export * from './AccountUserRelationship';
export * from './AccountGroupRelationship';
export * from './AccountRoleRelationship';
export * from './AccountServiceRelationship';
export * from './AccountPersonalDeviceRelationship';

export interface IdEntityMap<V> {
  [key: string]: V;
}
