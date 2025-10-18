import React from 'react';
import { CloseIcon } from './CloseIcon';

interface ErrorDisplayProps {
  errorMessage: string;
  onDismiss: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage, onDismiss }) => {
  return (
    <div 
        className="mt-6 flex items-center justify-between bg-red-900/50 p-3 rounded-lg border border-red-700/50 animate-fade-in"
        role="alert"
    >
      <p className="text-red-300 text-sm">{errorMessage}</p>
      <button
        onClick={onDismiss}
        className="p-1 rounded-full text-red-300 hover:bg-red-800/70 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-110"
        aria-label="Dismiss error message"
        title="Dismiss error"
      >
        <CloseIcon />
      </button>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ErrorDisplay;