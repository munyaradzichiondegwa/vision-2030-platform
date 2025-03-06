// threat-hunting/hunting-engine.ts
import { ThreatIntelligenceFeed, SigmaRules } from './threat-intel';
import { BehaviorAnalytics } from './behavior-analysis';

class ThreatHunter {
  private readonly BASELINE_DAYS = 30;
  private huntingBook = new Map<string, HuntingScenario>();
  
  constructor(
    private intelFeed: ThreatIntelligenceFeed,
    private sigma: SigmaRules,
    private behaviorAnalytics: BehaviorAnalytics
  ) {}

  // Automated hypothesis generation
  async generateHuntingHypotheses() {
    const recentIOCs = await this.intelFeed.getRecentIndicators();
    const sigmaRules = this.sigma.getRelevantRules();
    
    return [
      ...recentIOCs.map(ioc => ({
        type: 'IOC Hunt' as const,
        indicator: ioc,
        dataSources: ['DNS', 'Proxy', 'EDR']
      })),
      ...sigmaRules.map(rule => ({
        type: 'Behavior Pattern' as const,
        rule,
        dataSources: ['Process', 'Network', 'Auth']
      }))
    ];
  }

  // Cross-domain investigation
  async executeHunt(hypothesis: HuntingHypothesis) {
    const dataSources = await this.collectRelevantData(
      hypothesis.dataSources,
      this.BASELINE_DAYS
    );

    const results = await Promise.allSettled([
      this.analyzeProcessTree(dataSources.process),
      this.investigateNetworkPatterns(dataSources.network),
      this.detectAuthAnomalies(dataSources.auth)
    ]);

    return this.correlateFindings(results);
  }

  // Advanced detection techniques
  private async analyzeProcessTree(processData: ProcessLog[]) {
    return this.behaviorAnalytics.detectAnomalousProcessChains(
      processData,
      this.BASELINE_DAYS
    );
  }

  // MITRE ATT&CK mapping
  mapToMitreTactics(findings: HuntingFinding[]) {
    return findings.map(finding => ({
      ...finding,
      mitreTactics: this.mitreFramework.mapTechniques(
        finding.detectionPattern
      )
    }));
  }
}

// Supporting behavioral analytics
class BehaviorAnalytics {
  detectAnomalousProcessChains(processes: ProcessLog[], baselineDays: number) {
    const baseline = this.buildProcessTreeBaseline(baselineDays);
    return processes.filter(process => 
      this.isDeviatingFromBaseline(process, baseline)
    );
  }

  private isDeviatingFromBaseline(process: ProcessLog, baseline: ProcessBaseline) {
    const parentChildKey = `${process.parentHash}:${process.hash}`;
    const baselineFreq = baseline.parentChildFrequencies[parentChildKey] || 0;
    return baselineFreq < BASELINE_THRESHOLD;
  }
}