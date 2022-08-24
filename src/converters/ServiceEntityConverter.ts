import {
  SERVICE_ENTITY_CLASS,
  SERVICE_ENTITY_TYPE,
  ServiceEntity,
} from '../jupiterone';

export function getServiceEntities(
  oneloginAccountInfoName: string,
): ServiceEntity[] {
  const ssoService: ServiceEntity = {
    _type: SERVICE_ENTITY_TYPE,
    _key: `onelogin:sso:${oneloginAccountInfoName}`,
    _class: SERVICE_ENTITY_CLASS,
    name: 'SSO',
    displayName: 'Onelogin SSO',
    category: 'security',
    function: 'sso',
    controlDomain: 'identity-access',
  };

  const mfaService: ServiceEntity = {
    _type: SERVICE_ENTITY_TYPE,
    _key: `onelogin:mfa:${oneloginAccountInfoName}`,
    _class: SERVICE_ENTITY_CLASS,
    name: 'MFA',
    displayName: 'Onelogin MFA',
    category: 'security',
    function: 'mfa',
    controlDomain: 'identity-access',
  };

  return [ssoService, mfaService];
}
