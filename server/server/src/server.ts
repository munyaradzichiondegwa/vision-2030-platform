import app from "./app";
import environmentConfig from "./config/environment";
import database from "./config/database";
import logger from "./config/logger";

class Server {
  static async start() {
    try {
      // Connect to database
      await database.connect();

      // Start Express server
      const server = app.listen(environmentConfig.PORT, () => {
        logger.info(`🚀 Server running on port ${environmentConfig.PORT}`);
        logger.info(`🌐 Environment: ${environmentConfig.NODE_ENV}`);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => {
        logger.info("SIGTERM received. Shutting down gracefully");
        server.close(() => {
          database.disconnect();
          process.exit(0);
        });
      });
    } catch (error) {
      logger.error("Server failed to start", error);
      process.exit(1);
    }
  }
}

Server.start();
