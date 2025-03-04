import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export class AppError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode = 500, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const handleError = (error: unknown): AppError => {
  // Axios error handling
  if (error instanceof AxiosError) {
    const response = error.response?.data as ErrorResponse;
    return new AppError(
      response?.message || 'An unexpected error occurred',
      error.response?.status,
      response?.errors
    );
  }

  // Standard error handling
  if (error instanceof Error) {
    return new AppError(error.message);
  }

  // Fallback for unknown errors
  return new AppError('An unknown error occurred');
};

export const formatValidationErrors = (errors?: Record<string, string[]>): string => {
  if (!errors) return '';
  return Object.values(errors)
    .flat()
    .join(', ');
};