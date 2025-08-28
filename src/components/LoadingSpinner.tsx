import React from 'react';

interface LoadingSpinnerProps {
  type?: 'spin' | 'pulse' | 'dots' | 'wave' | 'bounce';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ 
  type = 'spin', 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const renderSpinner = () => {
    switch (type) {
      case 'spin':
        return (
          <div className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-loading-spin ${className}`}></div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-pulse ${className}`}></div>
        );
      
      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-dots`} style={{ animationDelay: '0s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-dots`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-dots`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        );
      
      case 'wave':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-wave`} style={{ animationDelay: '0s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-wave`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-wave`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-wave`} style={{ animationDelay: '0.3s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-wave`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        );
      
      case 'bounce':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-bounce`} style={{ animationDelay: '0s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-bounce`} style={{ animationDelay: '0.16s' }}></div>
            <div className={`${sizeClasses[size]} bg-primary rounded-full animate-loading-bounce`} style={{ animationDelay: '0.32s' }}></div>
          </div>
        );
      
      default:
        return (
          <div className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-loading-spin ${className}`}></div>
        );
    }
  };

  return renderSpinner();
};

// Loading Screen Component
interface LoadingScreenProps {
  message?: string;
  type?: 'spin' | 'pulse' | 'dots' | 'wave' | 'bounce';
}

export const LoadingScreen = ({ 
  message = "Loading...", 
  type = 'spin' 
}: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <LoadingSpinner type={type} size="lg" className="mx-auto" />
        <p className="text-foreground font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  type?: 'spin' | 'pulse' | 'dots' | 'wave' | 'bounce';
  children: React.ReactNode;
}

export const LoadingOverlay = ({ 
  isLoading, 
  message = "Loading...", 
  type = 'spin',
  children 
}: LoadingOverlayProps) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <LoadingSpinner type={type} size="lg" className="mx-auto" />
          <p className="text-foreground font-medium animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
}; 