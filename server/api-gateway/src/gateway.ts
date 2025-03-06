Let's focus on advanced API design, comprehensive security mechanisms, and sophisticated authentication strategies.

Advanced API Gateway
typescript
Copy
// api-gateway/src/gateway.ts
import express from 'express';
import httpProxy from 'http-proxy';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';

class APIGateway {
  private app: express.Application;
  private proxy: httpProxy;

  constructor() {
    this.app = express();
    this.proxy = httpProxy.createProxyServer();
    this.initializeMiddleware();
    this.setupRoutes();
  }

  private initializeMiddleware() {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));

    // Global rate limiting
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests, please try again later'
    });
    this.app.use(globalLimiter);

    // Request parsing and logging
    this.app.use(express.json());
    this.app.use(this.requestLogger);
  }

  private requestLogger(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  }

  private setupRoutes() {
    // Service-specific route configurations
    const serviceRoutes = {
      '/api/users': 'http://user-service:3001',
      '/api/auth': 'http://auth-service:3002',
      '/api/products': 'http://product-service:3003'
    };

    Object.entries(serviceRoutes).forEach(([path, target]) => {
      this.app.use(
        path, 
        createProxyMiddleware({ 
          target, 
          changeOrigin: true,
          pathRewrite: {
            [`^${path}`]: ''
          },
          onProxyRes: this.enhanceProxyResponse
        })
      );
    });

    // Error handling middleware
    this.app.use(this.errorHandler);
  }

  private enhanceProxyResponse(proxyRes: any, req: express.Request, res: express.Response) {
    // Add custom headers or perform response transformations
    proxyRes.headers['x-powered-by'] = 'Advanced API Gateway';
  }

  private errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error('Gateway Error:', err);
    res.status(500).json({
      error: 'Internal Gateway Error',
      message: err.message
    });
  }

  start(port: number = 8000) {
    this.app.listen(port, () => {
      console.log(`API Gateway running on port ${port}`);
    });
  }
}

export default new APIGateway();