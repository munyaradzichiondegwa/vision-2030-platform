import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { Express } from 'express';

class ErrorTracker {
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
      profilesSampleRate: 1.0,
      // Custom error filtering
      beforeSend(event, hint) {
        // Filter out sensitive information
        const error = hint.originalException;
        
        // Example: Ignore specific error types
        if (error instanceof TypeError) {
          return null;
        }

        // Sanitize potentially sensitive data
        if (event.request) {
          delete event.request.headers;
          delete event.request.data;
        }

        return event;
      }
    });

    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  // Centralized error reporting
  static captureException(error: Error, context?: any) {
    Sentry.captureException(error, {
      extra: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Custom error reporting
  static reportError(
    message: string, 
    level: Sentry.Severity = Sentry.Severity.Error,
    context?: any
  ) {
    Sentry.captureMessage(message, {
      level,
      extra: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Performance tracking
  static startTransaction(name: string) {
    return Sentry.startTransaction({ name });
  }

  // Error handler middleware
  static errorHandler(app: Express) {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Customize which errors should be reported
        return error.status !== 404 && error.status < 500;
      }
    }));
  }
}

export default ErrorTracker;