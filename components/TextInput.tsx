import React from 'react';
import { SparkleIcon } from './SparkleIcon';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  onSuggestClick?: () => void;
  isSuggestLoading?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, value, maxLength, onSuggestClick, isSuggestLoading, ...props }) => {
  const currentLength = String(value || '').length;

  const getCounterColor = () => {
    if (!maxLength) return 'text-gray-500';
    if (currentLength >= maxLength) return 'text-red-400';
    if (currentLength > maxLength * 0.9) return 'text-yellow-400';
    return 'text-gray-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
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
          maxLength={maxLength}
          className={`w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${onSuggestClick ? 'pr-12' : ''}`}
          {...props}
        />
        {onSuggestClick && (
          <button
            type="button"
            onClick={onSuggestClick}
            disabled={isSuggestLoading || !value}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-indigo-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Suggest synonyms"
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
    </div>
  );
};

export default TextInput;