import { appConfig } from '../app/config/app.config';

export const environment = {
  production: false,
  apiUrl: appConfig.api.baseUrl, // This maintains backward compatibility
  googleClientId: 'your-google-client-id-local',
  appName: appConfig.app.name + ' - Development'
};