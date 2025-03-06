import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import os from 'os';

class AdvancedLogger {
  private static instance: winston.Logger;

  static getInstance(): winston.Logger {
    if (!this.instance) {
      this.instance = this.createLogger();
    }
    return this.instance;
  }

  private static createLogger(): winston.Logger {
    const esTransportOpts = {
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
      },
      indexPrefix: 'app-logs',
      transformer: (logData: any) => {
        const transformed = {
          '@timestamp': new Date().toISOString(),
          severity: logData.level,
          message: logData.message,
          service: process.env.SERVICE_NAME || 'unknown-service',
          hostname: os.hostname(),
          pid: process.pid,
          metadata: logData.meta || {}
        };
        return transformed;
      }
    };

    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: process.env.SERVICE_NAME },
      transports: [
        // Console transport for local development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // Elasticsearch transport for centralized logging
        new ElasticsearchTransport(esTransportOpts),
        // File transport for backup
        new winston.transports.File({ 
          filename: 'error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'combined.log' 
        })
      ]
    });
  }

  // Structured logging method
  static log(level: string, message: string, meta?: Record<string, any>) {
    this.getInstance().log(level, message, { 
      metadata: {
        ...meta,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Audit trail logging
  static audit(action: string, userId: string, details: Record<string, any>) {
    this.log('info', `AUDIT: ${action}`, {
      userId,
      ...details,
      type: 'audit_trail'
    });
  }

  // Performance tracking
  static performance(
    operation: string, 
    duration: number, 
    details?: Record<string, any>
  ) {
    this.log('info', `PERFORMANCE: ${operation}`, {
      duration,
      ...details,
      type: 'performance_metric'
    });
  }
}

export default AdvancedLogger;