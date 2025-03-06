import client from 'prom-client';
import express from 'express';

class MonitoringSystem {
  private registry: client.Registry;

  constructor() {
    // Create a Registry which registers the metrics
    this.registry = new client.Registry();

    // Add default metrics
    client.collectDefaultMetrics({ 
      register: this.registry 
    });

    this.initializeCustomMetrics();
  }

  private initializeCustomMetrics() {
    // Custom application-specific metrics
    const requestCounter = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status']
    });
    this.registry.registerMetric(requestCounter);

    const requestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request latencies in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10]
    });
    this.registry.registerMetric(requestDuration);

    // Custom business metrics
    const activeUsers = new client.Gauge({
      name: 'active_users_total',
      help: 'Number of currently active users'
    });
    this.registry.registerMetric(activeUsers);
  }

  // Middleware for tracking HTTP requests
  createRequestTrackerMiddleware() {
    const requestCounter = this.registry.getMetric('http_requests_total') as client.Counter<string>;
    const requestDuration = this.registry.getMetric('http_request_duration_seconds') as client.Histogram<string>;

    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const startTime = Date.now();

      // Attach listener to response to track metrics
      res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000;
        
        requestCounter.inc({
          method: req.method,
          route: req.route?.path || req.path,
          status: res.statusCode
        });

        requestDuration.observe({
          method: req.method,
          route: req.route?.path || req.path,
          status: res.statusCode
        }, duration);
      });

      next();
    };
  }

  // Expose metrics endpoint
  createMetricsEndpoint(app: express.Application) {
    app.get('/metrics', async (req, res) => {
      res.set('Content-Type', this.registry.contentType);
      res.end(await this.registry.metrics());
    });
  }

  // Method to track custom business metrics
  trackActiveUsers(count: number) {
    const activeUsers = this.registry.getMetric('active_users_total') as client.Gauge<string>;
    activeUsers.set(count);
  }
}

export default new MonitoringSystem();