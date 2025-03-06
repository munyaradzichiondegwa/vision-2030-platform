import { z } from "zod";
import { Request, Response, NextFunction } from "express";

class ValidationMiddleware {
  // Generic validation middleware
  static validate(schema: z.ZodObject<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation Failed",
            errors: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          });
        }
        next(error);
      }
    };
  }

  // Input sanitization schemas
  static schemas = {
    user: z.object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be less than 50 characters")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores"
        ),

      email: z
        .string()
        .email("Invalid email format")
        .max(100, "Email must be less than 100 characters"),

      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must include uppercase, lowercase, number, and special character"
        ),
    }),

    // Add more validation schemas as needed
    updateProfile: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      bio: z
        .string()
        .max(500, "Bio must be less than 500 characters")
        .optional(),
    }),
  };

  // Custom validators
  static async validateUniqueEmail(email: string) {
    // Check if email already exists in database
    const existingUser = await User.findOne({ email });
    return !existingUser;
  }

  static async validateUniqueUsername(username: string) {
    // Check if username already exists in database
    const existingUser = await User.findOne({ username });
    return !existingUser;
  }
}

export default ValidationMiddleware;
