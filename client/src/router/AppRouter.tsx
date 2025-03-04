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