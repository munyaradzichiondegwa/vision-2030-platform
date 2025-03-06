enum CircuitState {
    CLOSED,
    OPEN,
    HALF_OPEN
  }
  
  class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureThreshold: number;
    private recoveryTime: number;
    private failureCount: number = 0;
    private lastFailureTime: number = 0;
  
    constructor(
      private action: () => Promise<any>,
      {
        failureThreshold = 5,
        recoveryTime = 30000 // 30 seconds
      } = {}
    ) {
      this.failureThreshold = failureThreshold;
      this.recoveryTime = recoveryTime;
    }
  
    async execute(...args: any[]) {
      if (this.state === CircuitState.OPEN) {
        // Check if enough time has passed to try again
        if (Date.now() - this.lastFailureTime < this.recoveryTime) {
          throw new Error('Circuit is OPEN');
        }
        
        this.state = CircuitState.HALF_OPEN;
      }
  
      try {
        const result = await this.action(...args);
        
        // Reset on successful call
        if (this.state === CircuitState.HALF_OPEN) {
          this.state = CircuitState.CLOSED;
        }
        this.failureCount = 0;
        
        return result;
      } catch (error) {
        this.handleFailure(error);
        throw error;
      }
    }
  
    private handleFailure(error: any) {
      this.failureCount++;
  
      if (this.failureCount >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.lastFailureTime = Date.now();
      }
    }
  }
  
  // Usage Example
  const apiCallCircuitBreaker = new CircuitBreaker(
    async () => {
      // External API call
      const response = await axios.get('https://api.example.com/data');
      return response.data;
    },
    {
      failureThreshold: 3,
      recoveryTime: 60000 // 1 minute
    }
  );