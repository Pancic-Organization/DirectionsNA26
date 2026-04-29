export const appConfig = {
  // Entra ID (Azure AD) OAuth
  entraId: {
    clientId: '<YOUR_ENTRA_CLIENT_ID>',
    tenantId: '<YOUR_ENTRA_TENANT_ID>',
    clientSecret: '<YOUR_ENTRA_CLIENT_SECRET>',
    tokenUrl: 'https://login.microsoftonline.com/<YOUR_ENTRA_TENANT_ID>/oauth2/v2.0/token',
    scope: 'https://api.businesscentral.dynamics.com/.default',
  },

  // Business Central
  bc: {
    environment: '<YOUR_BC_ENVIRONMENT>',
    companyId: '<YOUR_BC_COMPANY_ID>',
    baseUrl:
      'https://api.businesscentral.dynamics.com/v2.0/<YOUR_ENTRA_TENANT_ID>/<YOUR_BC_ENVIRONMENT>/api/v2.0/companies(<YOUR_BC_COMPANY_ID>)',
  },

  // App
  app: {
    displayName: 'DirectionsNA26',
    primaryColor: '#0078D4',
    demoCredentials: {
      username: 'rishabh.shukla',
      password: '1234',
    },
  },
};
