import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { Express } from 'express';

class ErrorReporter {
  static initialize(app: Express) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Enable Express tracing
        new Sentry.Integrations.Express({ app }),
        // Profiling integration
        new ProfilingIntegration()
      ],
      // Performance monitoring
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0
    });

    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  static captureException(error: Error) {
    Sentry.captureException(error);
  }

  static captureMessage(message: string, level?: Sentry.Severity) {
    Sentry.captureMessage(message, level);
  }

  // Error handler must be after all middleware and routes
  static setupErrorHandler(app: Express) {
    app.use(Sentry.Handlers.errorHandler());
  }
}

export default ErrorReporter;