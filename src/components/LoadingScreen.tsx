import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Loading...', fullScreen = true }: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50'
    : 'w-full h-full min-h-[200px]';

  return (
    <div className={`${containerClasses} flex items-center justify-center`}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground/80 text-lg">{message}</p>
      </div>
    </div>
  );
}
