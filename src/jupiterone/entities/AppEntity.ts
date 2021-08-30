import { Entity } from '@jupiterone/integration-sdk-core';

export const APP_ENTITY_TYPE = 'onelogin_application';
export const APP_ENTITY_CLASS = ['Application'];

export const APP_RULE_ENTITY_TYPE = 'onelogin_application_rule';
export const APP_RULE_ENTITY_CLASS = ['Configuration'];

export interface AppEntity extends Entity {
  id: string;
  connectorId: number;
  name: string;
  extension: boolean;
  visible: boolean;
  provisioning: boolean;
  ruleIds?: string;
}

export interface AppRuleEntity extends Entity {
  id: string;
  name: string;
  match: string;
  enabled: boolean;
  position: number;
  conditions: string;
  actions: string;
}
