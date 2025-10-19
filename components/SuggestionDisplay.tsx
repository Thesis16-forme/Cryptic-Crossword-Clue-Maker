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
    <div className="mt-2 p-4 bg-slate-50 border border-[var(--color-border)] rounded-lg animate-fade-in relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-accent)]">Suggestions for "{targetLabel}"</h3>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-gray-500 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 transform hover:scale-110"
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
                  className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No suggestions found.</p>
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