import axios from "axios";
import { RateLimiter } from "limiter";

interface ThreatIndicator {
  type: "IP" | "DOMAIN" | "HASH";
  value: string;
  reputation: number;
  tags: string[];
  lastSeen: Date;
}

class ThreatIntelligenceDetector {
  private static THREAT_INTEL_APIS = [
    "https://otx.alienvault.com/api/v1/indicators",
    "https://api.threatcrowd.org/v2",
    "https://www.virustotal.com/vtapi/v2",
  ];

  // Rate limiter to prevent API abuse
  private static apiRateLimiter = new RateLimiter({
    tokensPerInterval: 5,
    interval: "minute",
  });

  // Check IP reputation across multiple threat intelligence sources
  static async checkIPReputation(ip: string): Promise<{
    isThreat: boolean;
    reputation: number;
    details?: ThreatIndicator;
  }> {
    try {
      // Await rate limit
      await new Promise((resolve) =>
        this.apiRateLimiter.removeTokens(1, resolve)
      );

      // Parallel API checks
      const results = await Promise.allSettled(
        this.THREAT_INTEL_APIS.map((api) => this.queryThreatIntelAPI(api, ip))
      );

      // Aggregate results
      const threatIndicators = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<ThreatIndicator>).value);

      if (threatIndicators.length === 0) {
        return { isThreat: false, reputation: 1 };
      }

      // Calculate aggregate reputation
      const averageReputation =
        threatIndicators.reduce(
          (acc, indicator) => acc + indicator.reputation,
          0
        ) / threatIndicators.length;

      return {
        isThreat: averageReputation < 0.5,
        reputation: averageReputation,
        details: threatIndicators[0],
      };
    } catch (error) {
      console.error("Threat intelligence check failed", error);
      return { isThreat: false, reputation: 1 };
    }
  }

  // Generic API query method
  private static async queryThreatIntelAPI(
    apiBase: string,
    indicator: string
  ): Promise<ThreatIndicator> {
    try {
      const response = await axios.get(`${apiBase}/ip/${indicator}`, {
        headers: {
          "User-Agent": "ThreatIntelligenceDetector/1.0",
          Accept: "application/json",
        },
        timeout: 5000,
      });

      // Transform API response to standard format
      return this.transformThreatIndicator(response.data);
    } catch (error) {
      // Silently handle individual API failures
      console.warn(`Threat API ${apiBase} query failed`, error);
      throw error;
    }
  }

  // Transform API response to standard threat indicator
  private static transformThreatIndicator(apiResponse: any): ThreatIndicator {
    return {
      type: "IP",
      value: apiResponse.ip || apiResponse.indicator,
      reputation: apiResponse.reputation || 0.5,
      tags: apiResponse.tags || [],
      lastSeen: new Date(apiResponse.lastSeen || Date.now()),
    };
  }

  // Periodic threat intelligence update
  static async updateThreatIntelligence(): Promise<void> {
    // Implement periodic refresh of threat intelligence cache
  }
}

export default ThreatIntelligenceDetector;
