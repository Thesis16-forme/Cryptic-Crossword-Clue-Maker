import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, value, maxLength, ...props }) => {
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
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        {...props}
      />
    </div>
  );
};

export default TextInput;