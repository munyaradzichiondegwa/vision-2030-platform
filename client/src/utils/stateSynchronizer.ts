class StateSynchronizer {
    private static subscribers: Set<(state: any) => void> = new Set();
  
    static subscribe(callback: (state: any) => void) {
      this.subscribers.add(callback);
      return () => this.subscribers.delete(callback);
    }
  
    static notify(state: any) {
      this.subscribers.forEach(callback => callback(state));
    }
  
    static createSyncedState<T>(
      initialState: T, 
      key: string
    ) {
      let state = initialState;
  
      return {
        get: () => state,
        set: (newState: T) => {
          state = newState;
          this.notify({ [key]: state });
        },
        subscribe: (callback: (state: T) => void) => {
          const unsubscribe = this.subscribe((globalState) => {
            if (globalState[key] !== undefined) {
              callback(globalState[key]);
            }
          });
          return unsubscribe;
        }
      };
    }
  }
  
  export default StateSynchronizer;