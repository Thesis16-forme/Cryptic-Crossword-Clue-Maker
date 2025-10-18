import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { XIcon } from './icons/XIcon';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onClear: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, onClear }) => {
  return (
    <div
      className="mt-8 rounded-lg border border-red-300 bg-red-50 p-4 flex items-start space-x-4"
      role="alert"
    >
      <div className="flex-shrink-0">
        <AlertTriangleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
      </div>
      <div className="flex-grow">
        <p className="font-bold text-red-800">An Error Occurred</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        <div className="mt-4 flex items-center gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={onClear}
          className="p-1.5 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Clear error"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};