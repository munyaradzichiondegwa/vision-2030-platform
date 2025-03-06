import axios from "axios";
import { EventEmitter } from "events";

enum IncidentSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

enum IncidentStatus {
  DETECTED = "DETECTED",
  INVESTIGATING = "INVESTIGATING",
  CONTAINED = "CONTAINED",
  RESOLVED = "RESOLVED",
}

interface Incident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  timestamp: Date;
  details: Record<string, any>;
  affectedSystems?: string[];
}

class IncidentResponseOrchestrator extends EventEmitter {
  private static COMMUNICATION_CHANNELS = {
    SLACK: process.env.SLACK_WEBHOOK,
    PAGERDUTY: process.env.PAGERDUTY_API,
    EMAIL: process.env.INCIDENT_EMAIL,
  };

  private incidentQueue: Incident[] = [];

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Automated response based on incident type
    this.on("incident", async (incident: Incident) => {
      await this.assessAndEscalate(incident);
    });

    // Severity-based actions
    this.on("high-severity", this.triggerHighSeverityProtocol);
    this.on("critical-severity", this.triggerCriticalResponseProtocol);
  }

  // Create new incident
  createIncident(
    type: string,
    severity: IncidentSeverity,
    details: Record<string, any>
  ): Incident {
    const incident: Incident = {
      id: crypto.randomUUID(),
      type,
      severity,
      status: IncidentStatus.DETECTED,
      timestamp: new Date(),
      details,
    };

    this.incidentQueue.push(incident);
    this.emit("incident", incident);

    return incident;
  }

  // Assess and escalate incident
  private async assessAndEscalate(incident: Incident) {
    // Notify appropriate channels
    await this.notifyStakeholders(incident);

    // Trigger severity-specific response
    switch (incident.severity) {
      case IncidentSeverity.HIGH:
        this.emit("high-severity", incident);
        break;
      case IncidentSeverity.CRITICAL:
        this.emit("critical-severity", incident);
        break;
    }
  }

  // Notify stakeholders via multiple channels
  private async notifyStakeholders(incident: Incident) {
    const notifications = [
      this.sendSlackNotification(incident),
      this.sendPagerDutyAlert(incident),
      this.sendEmailAlert(incident),
    ];

    await Promise.allSettled(notifications);
  }

  // Slack notification
  private async sendSlackNotification(incident: Incident) {
    if (!this.COMMUNICATION_CHANNELS.SLACK) return;

    try {
      await axios.post(this.COMMUNICATION_CHANNELS.SLACK, {
        text: `🚨 Incident Alert: ${incident.type} - ${incident.severity}`,
        attachments: [
          {
            color: this.getSeverityColor(incident.severity),
            fields: [
              { title: "ID", value: incident.id, short: true },
              { title: "Status", value: incident.status, short: true },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Slack notification failed", error);
    }
  }

  // PagerDuty alert
  private async sendPagerDutyAlert(incident: Incident) {
    if (!this.COMMUNICATION_CHANNELS.PAGERDUTY) return;

    try {
      await axios.post(this.COMMUNICATION_CHANNELS.PAGERDUTY, {
        incident: {
          type: "incident",
          title: `Incident: ${incident.type}`,
          service: { id: "SERVICE_ID" },
          urgency: this.mapSeverityToPagerDuty(incident.severity),
          body: JSON.stringify(incident),
        },
      });
    } catch (error) {
      console.error("PagerDuty alert failed", error);
    }
  }

  // Email alert
  private async sendEmailAlert(incident: Incident) {
    if (!this.COMMUNICATION_CHANNELS.EMAIL) return;

    // Implement email sending logic
  }

  // High severity response protocol
  private triggerHighSeverityProtocol(incident: Incident) {
    // Implement isolation of affected systems
    // Trigger detailed forensic analysis
  }

  // Critical severity response protocol
  private triggerCriticalResponseProtocol(incident: Incident) {
    // Implement full system shutdown
    // Trigger disaster recovery procedures
    // Engage legal and compliance teams
  }

  // Utility methods
  private getSeverityColor(severity: IncidentSeverity): string {
    const colors = {
      [IncidentSeverity.LOW]: "#36a64f",
      [IncidentSeverity.MEDIUM]: "#f9a61a",
      [IncidentSeverity.HIGH]: "#f04f4f",
      [IncidentSeverity.CRITICAL]: "#ff0000",
    };
    return colors[severity];
  }

  private mapSeverityToPagerDuty(severity: IncidentSeverity): string {
    const mapping = {
      [IncidentSeverity.LOW]: "low",
      [IncidentSeverity.MEDIUM]: "moderate",
      [IncidentSeverity.HIGH]: "high",
      [IncidentSeverity.CRITICAL]: "urgent",
    };
    return mapping[severity];
  }
}

export default IncidentResponseOrchestrator;
