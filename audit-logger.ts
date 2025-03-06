import winston from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";
import os from "os";
import crypto from "crypto";

enum AuditLogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  service: string;
  user?: string;
  action: string;
  resource?: string;
  metadata?: Record<string, any>;
  level: AuditLogLevel;
  ipAddress?: string;
}

class AdvancedAuditLogger {
  private static instance: winston.Logger;
  private static esTransport: ElasticsearchTransport;

  private static getInstance(): winston.Logger {
    if (!this.instance) {
      this.instance = this.createLogger();
    }
    return this.instance;
  }

  private static createLogger(): winston.Logger {
    // Elasticsearch transport configuration
    this.esTransport = new ElasticsearchTransport({
      level: "info",
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
      },
      indexPrefix: "audit-logs",
      transformer: (logData) => {
        const transformed = {
          "@timestamp": new Date().toISOString(),
          severity: logData.level,
          message: logData.message,
          service: process.env.SERVICE_NAME || "unknown",
          hostname: os.hostname(),
          pid: process.pid,
        };
        return transformed;
      },
    });

    return winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
        // Elasticsearch transport
        this.esTransport,
        // File transport for backup
        new winston.transports.File({
          filename: "audit.log",
          maxsize: 5 * 1024 * 1024, // 5MB
        }),
      ],
    });
  }

  // Log security-related events
  static logSecurityEvent(
    action: string,
    metadata: Record<string, any> = {},
    level: AuditLogLevel = AuditLogLevel.INFO
  ): void {
    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      service: process.env.SERVICE_NAME || "unknown",
      action,
      metadata,
      level,
      ipAddress: this.getCurrentRequestIP(),
    };

    this.getInstance().log({
      level: level,
      message: JSON.stringify(logEntry),
    });
  }

  // Log authentication events
  static logAuthEvent(
    user: string,
    action: "LOGIN" | "LOGOUT" | "PASSWORD_CHANGE",
    success: boolean
  ): void {
    this.logSecurityEvent(
      action,
      {
        user,
        success,
      },
      success ? AuditLogLevel.INFO : AuditLogLevel.WARN
    );
  }

  // Log access control events
  static logAccessControlEvent(
    user: string,
    resource: string,
    action: string,
    authorized: boolean
  ): void {
    this.logSecurityEvent(
      "ACCESS_CONTROL",
      {
        user,
        resource,
        action,
        authorized,
      },
      authorized ? AuditLogLevel.INFO : AuditLogLevel.ERROR
    );
  }

  // Retrieve recent audit logs
  static async getRecentLogs(
    options: {
      limit?: number;
      level?: AuditLogLevel;
      startDate?: Date;
    } = {}
  ): Promise<AuditLogEntry[]> {
    // In a real-world scenario, would query Elasticsearch
    // This is a simplified mock implementation
    return [];
  }

  // Utility method to get current request IP
  private static getCurrentRequestIP(): string | undefined {
    // In an actual implementation, would retrieve from request context
    return undefined;
  }

  // Secure log rotation and archiving
  static async rotateAndArchiveLogs(): Promise<void> {
    // Implement log rotation and archiving strategy
    // This would involve moving old logs to cold storage
  }
}

export default AdvancedAuditLogger;
