import opentelemetry from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Express } from 'express';

class DistributedTracing {
  private static tracer: opentelemetry.Tracer;

  static initialize() {
    const provider = new NodeTracerProvider();

    // Jaeger exporter
    const jaegerExporter = new JaegerExporter({
      serviceName: process.env.SERVICE_NAME || 'unknown-service',
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
    });

    // Add span processor
    provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
    provider.register();

    // Create tracer
    this.tracer = opentelemetry.trace.getTracer('app-tracer');
  }

  // Middleware for distributed tracing
  static createTracingMiddleware() {
    return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      const span = this.tracer.startSpan(`${req.method} ${req.path}`);

      // Add request details to span
      span.setAttribute('http.method', req.method);
      span.setAttribute('http.url', req.url);
      span.setAttribute('http.host', req.get('host') || 'unknown');

      // Attach span to request for potential use in route handlers
      (req as any).activeSpan = span;

      // Ensure span is ended when response is finished
      res.on('finish', () => {
        span.setAttribute('http.status_code', res.statusCode);
        span.end();
      });

      next();
    };
  }

  // Method to create manual spans
  static startSpan(name: string, parentSpan?: opentelemetry.Span) {
    const spanOptions: opentelemetry.SpanOptions = parentSpan 
      ? { parent: parentSpan } 
      : {};

    return this.tracer.startSpan(name, spanOptions);
  }
}

export default DistributedTracing;