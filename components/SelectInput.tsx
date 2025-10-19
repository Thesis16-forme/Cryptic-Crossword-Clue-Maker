import React from 'react';
import { InfoIcon } from './InfoIcon';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  infoText?: string;
  getOptionTitle?: (value: string) => string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, options, infoText, getOptionTitle, ...props }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
        {infoText && (
          <div className="relative group" title="Show help">
            <InfoIcon />
            <div
              className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10"
              role="tooltip"
            >
              <p className="font-bold mb-1 text-[var(--color-text-primary)]">{label} Help</p>
              {infoText}
            </div>
          </div>
        )}
      </div>
      <select
        id={id}
        className="w-full bg-white border border-[var(--color-border)] rounded-md shadow-sm py-3 px-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition appearance-none bg-no-repeat"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236C757D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} title={getOptionTitle ? getOptionTitle(option.value) : undefined}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;