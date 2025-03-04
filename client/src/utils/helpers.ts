Let's continue building out our application structure by focusing on routing, error handling, and creating some utility functions.

App Router
typescript
Copy
// src/router/AppRouter.tsx
import React, { lazy, Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load components
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Protected Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (isAuthenticated && user?.role === 'admin') 
    ? <>{children}</>
    : <Navigate to="/dashboard" replace />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Root and 404 Routes */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
Error Handling Utility
typescript
Copy
// src/utils/errorHandler.ts
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
Utility Functions
typescript
Copy
// src/utils/helpers.ts
export const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const dateObj = new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateText = (text: string, maxLength = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const debounce = <F extends (...args: any[]) => any>(
  func: F, 
  delay = 300
): (...args: Parameters<F>) => void => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};