import prometheus from 'prom-client';
import express from 'express';

class PrometheusMonitoring {
  private static instance: PrometheusMonitoring;
  public registry: prometheus.Registry;

  private constructor() {
    this.registry = new prometheus.Registry();
    
    // Default metrics
    prometheus.collectDefaultMetrics({ 
      register: this.registry 
    });

    // Custom metrics
    this.createCustomMetrics();
  }

  static getInstance(): PrometheusMonitoring {
    if (!this.instance) {
      this.instance = new PrometheusMonitoring();
    }
    return this.instance;
  }

  private createCustomMetrics() {
    // Request duration histogram
    const httpRequestDurationSeconds = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
    });
    this.registry.registerMetric(httpRequestDurationSeconds);

    // Error counter
    const httpErrorCounter = new prometheus.Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'error_code']
    });
    this.registry.registerMetric(httpErrorCounter);
  }

  // Middleware for tracking request metrics
  createMiddleware() {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const end = this.registry
        .getMetric('http_request_duration_seconds')
        .startTimer();

      res.on('finish', () => {
        end({ 
          method: req.method, 
          route: req.route?.path || req.path,
          status: res.statusCode 
        });

        // Track errors
        if (res.statusCode >= 400) {
          this.registry
            .getMetric('http_errors_total')
            .inc({
              method: req.method,
              route: req.route?.path || req.path,
              error_code: res.statusCode
            });
        }
      });

      next();
    };
  }

  // Expose metrics endpoint
  setupMetricsRoute(app: express.Application) {
    app.get('/metrics', async (req, res) => {
      res.set('Content-Type', this.registry.contentType);
      res.end(await this.registry.metrics());
    });
  }
}

export default PrometheusMonitoring;