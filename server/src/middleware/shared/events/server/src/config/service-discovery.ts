import consul from 'consul';

class ServiceDiscovery {
  private consulClient: consul.Consul;
  private serviceName: string;
  private serviceId: string;

  constructor(serviceName: string, port: number) {
    this.serviceName = serviceName;
    this.serviceId = `${serviceName}-${process.pid}`;
    
    this.consulClient = new consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: parseInt(process.env.CONSUL_PORT || '8500')
    });
  }

  async register() {
    const check = {
      id: this.serviceId,
      name: this.serviceName,
      address: process.env.SERVICE_HOST || 'localhost',
      port: parseInt(process.env.SERVICE_PORT || '3000'),
      check: {
        ttl: '10s',
        deregister_critical_service_after: '1m'
      }
    };

    return new Promise((resolve, reject) => {
      this.consulClient.agent.service.register(check, (err) => {
        if (err) return reject(err);
        
        // Periodic health check
        setInterval(() => {
          this.consulClient.agent.check.pass({
            id: `service:${this.serviceId}`
          });
        }, 5000);

        resolve(true);
      });
    });
  }

  async findService(serviceName: string) {
    return new Promise((resolve, reject) => {
      this.consulClient.catalog.service.nodes(serviceName, (err, result) => {
        if (err) return reject(err);
        
        if (!result || result.length === 0) {
          return reject(new Error(`No instances of ${serviceName} found`));
        }

        // Return a random service instance
        const service = result[Math.floor(Math.random() * result.length)];
        resolve({
          address: service.ServiceAddress,
          port: service.ServicePort
        });
      });
    });
  }
}

export default ServiceDiscovery;