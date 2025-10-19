import React from 'react';
import { SparkleIcon } from './SparkleIcon';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  onSuggestClick?: () => void;
  isSuggestLoading?: boolean;
  isHighlighted?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, value, maxLength, onSuggestClick, isSuggestLoading, isHighlighted, ...props }) => {
  const currentLength = String(value || '').length;
  const isOverLimit = maxLength ? currentLength > maxLength : false;

  const getCounterColor = () => {
    if (!maxLength) return 'text-gray-400';
    if (isOverLimit) return 'text-red-500';
    if (currentLength > maxLength * 0.9) return 'text-amber-500';
    return 'text-gray-400';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
        {maxLength && (
          <span className={`text-xs font-mono transition-colors ${getCounterColor()}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          className={`w-full bg-white border rounded-md shadow-sm py-3 px-4 text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 transition ${onSuggestClick ? 'pr-12' : ''} ${isHighlighted ? 'highlight-animation' : ''} ${isOverLimit ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'} ${props.disabled ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''}`}
          {...props}
        />
        {onSuggestClick && (
          <button
            type="button"
            onClick={onSuggestClick}
            disabled={props.disabled || isSuggestLoading || !value}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
            aria-label="Suggest synonyms"
            title="Suggest synonyms"
          >
            {isSuggestLoading ? (
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <SparkleIcon />
            )}
          </button>
        )}
      </div>
      {isHighlighted && (
        <style>{`
            .highlight-animation {
                animation: highlight-pulse 1s ease-out;
            }
            @keyframes highlight-pulse {
                0% { box-shadow: 0 0 0 0px rgba(73, 88, 103, 0.5); }
                50% { box-shadow: 0 0 0 4px rgba(73, 88, 103, 0); }
                100% { box-shadow: 0 0 0 0px rgba(73, 88, 103, 0); }
            }
        `}</style>
      )}
    </div>
  );
};

export default TextInput;