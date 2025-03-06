import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

class ValidationMiddleware {
  static validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Validate request body
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation Failed",
            errors: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }
        next(error);
      }
    };
  }

  // Validation schemas
  static schemas = {
    user: z.object({
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must include uppercase, lowercase, number, and special character"
        ),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be less than 50 characters"),
    }),

    login: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    }),
  };
}

export default ValidationMiddleware;
