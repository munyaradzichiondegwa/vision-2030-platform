import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
        <div 
          className={`${sizeClasses[size]} border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
