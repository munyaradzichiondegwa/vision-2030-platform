import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';

// Zod schema for configuration validation
const ConfigSchema = z.object({
  // Server configurations
  SERVER: z.object({
    PORT: z.number().default(3000),
    ENV: z.enum(['development', 'staging', 'production']).default('development'),
    DEBUG: z.boolean().default(false)
  }),

  // Database configurations
  DATABASE: z.object({
    URI: z.string(),
    MAX_CONNECTIONS: z.number().default(10),
    TIMEOUT: z.number().default(30000)
  }),

  // Authentication configurations
  AUTH: z.object({
    JWT_SECRET: z.string(),
    TOKEN_EXPIRATION: z.string().default('1h'),
    REFRESH_TOKEN_EXPIRATION: z.string().default('7d')
  }),

  // External services
  SERVICES: z.object({
    PAYMENT_GATEWAY: z.string().url().optional(),
    NOTIFICATION_SERVICE: z.string().url().optional()
  }).optional()
});

type ConfigType = z.infer<typeof ConfigSchema>;

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: ConfigType;

  private constructor() {
    this.loadConfiguration();
  }

  // Singleton pattern
  static getInstance(): ConfigurationManager {
    if (!this.instance) {
      this.instance = new ConfigurationManager();
    }
    return this.instance;
  }

  // Load configuration from multiple sources
  private loadConfiguration() {
    // Load base configuration
    const baseConfig = this.loadBaseConfig();

    // Override with environment-specific config
    const envConfig = this.loadEnvironmentConfig();

    // Merge configurations
    const mergedConfig = this.mergeConfigurations(baseConfig, envConfig);

    // Validate configuration
    this.config = this.validateConfiguration(mergedConfig);
  }

  // Load base configuration
  private loadBaseConfig(): Partial<ConfigType> {
    // Load base config from YAML
    const configPath = path.resolve(process.cwd(), 'config', 'base.yml');
    
    try {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      return yaml.load(fileContents) as Partial<ConfigType>;
    } catch (error) {
      console.warn('Base configuration file not found, using defaults');
      return {};
    }
  }

  // Load environment-specific configuration
  private loadEnvironmentConfig(): Partial<ConfigType> {
    // Load .env file
    dotenv.config();

    // Convert environment variables
    return {
      SERVER: {
        ENV: process.env.NODE_ENV as any,
        PORT: process.env.PORT ? parseInt(process.env.PORT) : undefined,
        DEBUG: process.env.DEBUG === 'true'
      },
      DATABASE: {
        URI: process.env.DATABASE_URI,
        MAX_CONNECTIONS: process.env.DB_MAX_CONNECTIONS 
          ? parseInt(process.env.DB_MAX_CONNECTIONS) 
          : undefined
      },
      AUTH: {
        JWT_SECRET: process.env.JWT_SECRET,
        TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION
      }
    };
  }

  // Merge configurations with prioritization
  private mergeConfigurations(
    baseConfig: Partial<ConfigType>, 
    envConfig: Partial<ConfigType>
  ): Partial<ConfigType> {
    return {
      SERVER: { ...baseConfig.SERVER, ...envConfig.SERVER },
      DATABASE: { ...baseConfig.DATABASE, ...envConfig.DATABASE },
      AUTH: { ...baseConfig.AUTH, ...envConfig.AUTH },
      SERVICES: { ...baseConfig.SERVICES, ...envConfig.SERVICES }
    };
  }

  // Validate configuration
  private validateConfiguration(config: Partial<ConfigType>): ConfigType {
    try {
      return ConfigSchema.parse(config);
    } catch (error) {
      console.error('Configuration validation failed', error);
      throw new Error('Invalid configuration');
    }
  }

  // Get configuration value
  get<K extends keyof ConfigType>(key: K): ConfigType[K] {
    return this.config[key];
  }

  // Dynamic configuration reloading
  reloadConfiguration() {
    this.loadConfiguration();
  }

  // Feature flag management
  isFeatureEnabled(feature: string): boolean {
    const featureFlags = this.config.SERVER.DEBUG 
      ? this.loadDevelopmentFeatureFlags()
      : this.loadProductionFeatureFlags();
    
    return featureFlags[feature] || false;
  }

  private loadDevelopmentFeatureFlags(): Record<string, boolean> {
    return {
      USER_REGISTRATION: true,
      ADVANCED_ANALYTICS: true,
      BETA_FEATURES: true
    };
  }

  private loadProductionFeatureFlags(): Record<string, boolean> {
    return {
      USER_REGISTRATION: true,
      ADVANCED_ANALYTICS: false,
      BETA_FEATURES: false
    };
  }
}

export default ConfigurationManager;