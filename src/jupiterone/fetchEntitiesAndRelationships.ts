import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";
import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  accounts: Entities.AccountEntity[];
  groups: Entities.GroupEntity[];
  users: Entities.UserEntity[];
  roles: Entities.RoleEntity[];
  apps: Entities.AppEntity[];
  personalApps: Entities.PersonalAppEntity[];
  services: Entities.StandardizedOneloginServiceEntity[];
}

export interface JupiterOneRelationshipsData {
  userGroupRelationships: Entities.UserGroupRelationship[];
  userRoleRelationships: Entities.UserRoleRelationship[];
  userAppRelationships: Entities.UserAppRelationship[];
  userPersonalAppRelationships: Entities.UserPersonalAppRelationship[];

  accountAppRelationships: Entities.AccountAppRelationship[];
  accountUserRelationships: Entities.AccountUserRelationship[];
  accountGroupRelationships: Entities.AccountGroupRelationship[];
  accountRoleRelationships: Entities.AccountRoleRelationship[];
  accountServiceRelationships: Entities.AccountServiceRelationship[];
}

export interface JupiterOneDataModel {
  entities: JupiterOneEntitiesData;
  relationships: JupiterOneRelationshipsData;
}

export default async function fetchEntitiesAndRelationships(
  graph: GraphClient,
): Promise<JupiterOneDataModel> {
  const data: JupiterOneDataModel = {
    entities: await fetchEntities(graph),
    relationships: await fetchRelationships(graph),
  };

  return data;
}

async function fetchEntities(
  graph: GraphClient,
): Promise<JupiterOneEntitiesData> {
  const [
    accounts,
    users,
    groups,
    roles,
    apps,
    personalApps,
    services,
  ] = await Promise.all([
    graph.findEntitiesByType<Entities.AccountEntity>(
      Entities.ACCOUNT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.UserEntity>(Entities.USER_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.GroupEntity>(Entities.GROUP_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.RoleEntity>(Entities.ROLE_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.AppEntity>(Entities.APP_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.PersonalAppEntity>(
      Entities.PERSONAL_APP_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.StandardizedOneloginServiceEntity>(
      Entities.SERVICE_ENTITY_TYPE,
    ),
  ]);

  return {
    accounts,
    users,
    groups,
    roles,
    apps,
    personalApps,
    services,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [
    userGroupRelationships,
    userRoleRelationships,
    userAppRelationships,
    userPersonalAppRelationships,

    accountAppRelationships,
    accountUserRelationships,
    accountGroupRelationships,
    accountRoleRelationships,
    accountServiceRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType(Entities.USER_GROUP_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.USER_ROLE_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.USER_APP_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.USER_PERSONAL_APP_RELATIONSHIP_TYPE),

    graph.findRelationshipsByType(Entities.ACCOUNT_APP_RELATIONSHIP_CLASS),
    graph.findRelationshipsByType(Entities.ACCOUNT_USER_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.ACCOUNT_GROUP_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.ACCOUNT_ROLE_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.ACCOUNT_SERVICE_RELATIONSHIP_TYPE),
  ]);

  return {
    userGroupRelationships,
    userRoleRelationships,
    userAppRelationships,
    userPersonalAppRelationships,

    accountAppRelationships,
    accountUserRelationships,
    accountGroupRelationships,
    accountRoleRelationships,
    accountServiceRelationships,
  };
}
