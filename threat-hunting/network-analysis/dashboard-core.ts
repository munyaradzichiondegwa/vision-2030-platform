// visualization/dashboard-core.ts
import { SecurityDataLake } from "./data-lake";
import { ThreatGraphRenderer } from "./graph-rendering";

class SecurityDashboard {
  private readonly REFRESH_INTERVAL = 10000; // 10 seconds

  constructor(
    private dataLake: SecurityDataLake,
    private renderer: ThreatGraphRenderer
  ) {
    this.initializeRealTimeUpdates();
  }

  // Unified data aggregation
  async getDashboardData() {
    return Promise.all([
      this.dataLake.getThreatHuntingResults(),
      this.dataLake.getNetworkMetrics(),
      this.dataLake.getValidationStatus(),
    ]).then(([hunting, network, validation]) => ({
      huntingInsights: this.processHuntingData(hunting),
      networkHealth: this.calculateNetworkHealth(network),
      validationStatus: this.mapValidationResults(validation),
    }));
  }

  // Interactive visualization
  renderThreatGraph(container: HTMLElement) {
    return this.renderer.createInteractiveGraph(container, {
      nodeTypes: ["host", "user", "service"],
      relationTypes: ["communicates", "authenticates", "depends"],
    });
  }

  // Real-time updates
  private initializeRealTimeUpdates() {
    const eventSource = new EventSource("/api/security-events");

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleLiveUpdate(update);
    };
  }

  // Customizable widgets
  createCustomWidget(config: WidgetConfig) {
    return new DynamicWidget({
      dataSource: this.dataLake.getAdaptiveDataSource(config),
      visualization: config.visualType,
      refreshInterval: config.refreshRate,
    });
  }
}

// Example visualization component
class ThreatGraphRenderer {
  createInteractiveGraph(container: HTMLElement, options: GraphOptions) {
    return new ForceDirectedGraph(container, {
      nodeRadius: (d) => Math.sqrt(d.criticality) * 5,
      linkWidth: (l) => l.strength,
      colorScheme: {
        host: "#4e79a7",
        user: "#59a14f",
        service: "#edc948",
      },
      ...options,
    });
  }
}
