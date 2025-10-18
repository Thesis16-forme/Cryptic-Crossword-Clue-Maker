import React from 'react';
import { CloseIcon } from './CloseIcon';
import Spinner from './Spinner';

interface SuggestionDisplayProps {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onDismiss: () => void;
  targetLabel: string;
}

const SuggestionDisplay: React.FC<SuggestionDisplayProps> = ({ suggestions, isLoading, onSuggestionClick, onDismiss, targetLabel }) => {
  return (
    <div className="mt-2 p-4 bg-gray-700/80 border border-gray-600 rounded-lg animate-fade-in relative backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-indigo-300">Suggestions for "{targetLabel}"</h3>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 transform hover:scale-110"
          aria-label="Close suggestions"
          title="Close suggestions"
        >
          <CloseIcon />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-16">
            <Spinner />
        </div>
      ) : (
        <>
          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded-full hover:bg-indigo-500 hover:text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No suggestions found.</p>
          )}
        </>
      )}
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

export default SuggestionDisplay;