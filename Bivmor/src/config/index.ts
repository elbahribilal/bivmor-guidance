// Main Configuration Export
// Central hub for all configuration

export { envConfig } from './env';
export { apiConfig } from './api';
export { adminConfig } from './admin';
export { featuresConfig } from './features';
export { authConfig } from './auth';

// Type exports - derive types from the const objects
import { envConfig } from './env';
import { apiConfig } from './api';
import { adminConfig } from './admin';
import { featuresConfig } from './features';
import { authConfig } from './auth';

export type EnvConfig = typeof envConfig;
export type ApiConfig = typeof apiConfig;
export type AdminConfig = typeof adminConfig;
export type FeaturesConfig = typeof featuresConfig;
export type AuthConfig = typeof authConfig;
