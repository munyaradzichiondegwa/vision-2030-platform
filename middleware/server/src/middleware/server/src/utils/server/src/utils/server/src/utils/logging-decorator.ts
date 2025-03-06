import logger from "../config/logger";

export function LogMethod() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;

      try {
        logger.info(`Calling ${className}.${propertyKey}`, {
          arguments: args,
        });

        const startTime = Date.now();
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        logger.info(`${className}.${propertyKey} completed`, {
          duration: `${duration}ms`,
          result: result ? "Success" : "No result",
        });

        return result;
      } catch (error) {
        logger.error(`Error in ${className}.${propertyKey}`, {
          error,
          arguments: args,
        });
        throw error;
      }
    };

    return descriptor;
  };
}
