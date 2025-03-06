import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

class OpenTelemetryConfig {
  private static instance: NodeSDK;

  static initialize() {
    // Jaeger exporter configuration
    const jaegerExporter = new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    });

    // Create OpenTelemetry SDK
    this.instance = new NodeSDK({
      traceExporter: jaegerExporter,
      spanProcessor: new BatchSpanProcessor(jaegerExporter),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Customize auto-instrumentation
          '@opentelemetry/instrumentation-fs': {
            enabled: false
          }
        })
      ]
    });

    // Start the SDK
    this.instance.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      this.instance.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.error('Error shutting down tracing', error));
    });
  }
}

export default OpenTelemetryConfig;