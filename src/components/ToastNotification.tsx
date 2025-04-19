import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, X, ShoppingCart } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'cart';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'cart':
        return <ShoppingCart className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

 const getBgColor = () => {
  switch (type) {
    case 'success':
      return 'bg-green-500 border-l-4 border-green-600';
    case 'error':
      return 'bg-red-500 border-l-4 border-red-600';
    case 'info':
      return 'bg-blue-500 border-l-4 border-blue-600';
    case 'cart':
      return 'bg-primary border-l-4 border-primary'; // Assuming 'primary' is a solid color
    default:
      return 'bg-accent';
  }
};

  return (
    <div 
      className={`${getBgColor()} px-4 py-3 rounded-md shadow-lg flex items-center justify-between mb-3 animate-slide-in`}
      style={{
        maxWidth: '350px',
        width: '100%'
      }}
    >
      <div className="flex items-center">
        {getIcon()}
        <span className="ml-3">{message}</span>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="ml-4 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
