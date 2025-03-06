import os from 'os';
import cluster from 'cluster';

class ClusterManager {
  private static MAX_WORKERS = os.cpus().length;

  static start(startServer: () => void) {
    // If we are the master process, fork workers
    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`);

      // Fork workers
      for (let i = 0; i < this.MAX_WORKERS; i++) {
        cluster.fork();
      }

      // Handle worker exit
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Replace the dead worker
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        for (const id in cluster.workers) {
          cluster.workers[id]?.disconnect();
        }
      });
    } else {
      // Workers can share any TCP connection
      // In this case, it is an HTTP server
      startServer();
    }
  }

  // Dynamic worker management
  static adjustWorkers(desiredWorkers: number) {
    const currentWorkers = Object.keys(cluster.workers).length;

    if (desiredWorkers > currentWorkers) {
      // Add workers
      for (let i = 0; i < desiredWorkers - currentWorkers; i++) {
        cluster.fork();
      }
    } else if (desiredWorkers < currentWorkers) {
      // Remove workers
      const workersToRemove = currentWorkers - desiredWorkers;
      let removed = 0;

      for (const id in cluster.workers) {
        if (removed < workersToRemove) {
          cluster.workers[id]?.disconnect();
          removed++;
        }
      }
    }
  }
}

export default ClusterManager;