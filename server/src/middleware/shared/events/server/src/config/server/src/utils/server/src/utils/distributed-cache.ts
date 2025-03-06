import Redis from 'ioredis';
import { promisify } from 'util';

class DistributedCache {
  private client: Redis;
  private clusterClient: Redis.Cluster | null = null;

  constructor(config: {
    hosts?: string[],
    standalone?: string
  }) {
    if (config.hosts && config.hosts.length > 1) {
      // Cluster mode
      this.clusterClient = new Redis.Cluster(
        config.hosts.map(host => ({
          host: host.split(':')[0],
          port: parseInt(host.split(':')[1] || '6379')
        })),
        {
          scaleReads: 'all',
          maxRedirections: 5,
          retryStrategy: (times) => {
            return Math.min(times * 50, 2000);
          }
        }
      );
    } else {
      // Standalone mode
      this.client = new Redis(
        config.standalone || 'redis://localhost:6379',
        {
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true; // Reconnect
            }
            return false;
          }
        }
      );
    }
  }

  async set(
    key: string, 
    value: any, 
    options?: { 
      ttl?: number, 
      nx?: boolean 
    }
  ) {
    const client = this.clusterClient || this.client;
    const serializedValue = JSON.stringify(value);

    if (options?.ttl) {
      return client.set(key, serializedValue, 'EX', options.ttl);
    }

    return client.set(key, serializedValue, 
      options?.nx ? 'NX' : undefined
    );
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.clusterClient || this.client;
    const result = await client.get(key);
    
    return result ? JSON.parse(result) : null;
  }

  // Distributed lock mechanism
  async acquireLock(
    resource: string, 
    ttl: number = 10000
  ): Promise<string | null> {
    const client = this.clusterClient || this.client;
    const lockKey = `lock:${resource}`;
    const lockValue = Date.now().toString();

    const result = await client.set(
      lockKey, 
      lockValue, 
      'NX', 
      'PX', 
      ttl
    );

    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(
    resource: string, 
    lockValue: string
  ): Promise<boolean> {
    const client = this.clusterClient || this.client;
    const lockKey = `lock:${resource}`;

    // Lua script for atomic unlock
    const unlockScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await client.eval(
      unlockScript, 
      1, 
      lockKey, 
      lockValue
    );

    return result === 1;
  }
}

export default DistributedCache;