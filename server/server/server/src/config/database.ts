import mongoose from "mongoose";
import logger from "./logger";
import environmentConfig from "./environment";

class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect() {
    try {
      await mongoose.connect(environmentConfig.DATABASE_URL, {
        // MongoDB connection options
        retryWrites: true,
        w: "majority",
      });
      logger.info("✅ MongoDB Connected Successfully");
    } catch (error) {
      logger.error("❌ MongoDB Connection Failed", error);
      process.exit(1);
    }
  }

  async disconnect() {
    await mongoose.connection.close();
    logger.info("MongoDB Disconnected");
  }
}

export default DatabaseConnection.getInstance();
