import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import environmentConfig from "./config/environment";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: environmentConfig.CORS_ORIGIN,
        credentials: true,
      })
    );
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/users", userRoutes);
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }
}

export default new App().app;
