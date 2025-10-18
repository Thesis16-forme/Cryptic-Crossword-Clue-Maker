import React from 'react';
import { type FormData, type CrypticDevice, type Difficulty, type Persona } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface InputFormProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onClear: () => void;
  onExample: () => void;
  isFindingDefinition: boolean;
  onFindDefinition: () => void;
  errors: Partial<Record<keyof FormData, string>>;
  saveMessage: string;
}

const crypticDevices: CrypticDevice[] = [
  'Any',
  'Anagram',
  'Charade',
  'Container',
  'Reversal',
  'Hidden Word',
  'Homophone',
  'Deletion',
  'Double Definition',
  'Cryptic Definition',
  '& Lit.'
];

const difficultyLevels: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const personaTypes: Persona[] = ['Guardian Master Setter', 'Witty Punster', 'Concise Ximenean'];

const InputField: React.FC<{label: string, id: string, children: React.ReactNode}> = ({label, id, children}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-stone-600 mb-1 font-serif">
            {label}
        </label>
        {children}
    </div>
);


export const InputForm: React.FC<InputFormProps> = ({ 
    formData, 
    onChange, 
    onSubmit, 
    isLoading, 
    onClear, 
    onExample,
    isFindingDefinition,
    onFindDefinition,
    errors,
    saveMessage
}) => {
  const answerError = errors.answer;
  const definitionError = errors.definition;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={onSubmit} onKeyDown={handleKeyDown} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-stone-200 space-y-6 relative">
      {saveMessage && (
        <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          {saveMessage}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Answer" id="answer">
            <div className="relative">
              <div className="flex items-center gap-2">
                  <input
                      type="text"
                      id="answer"
                      name="answer"
                      value={formData.answer}
                      onChange={onChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-teal-500 transition duration-150 ease-in-out ${answerError ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-stone-300 focus:ring-teal-500'}`}
                      placeholder="e.g., STAGNATE"
                      required
                      aria-invalid={!!answerError}
                      aria-describedby={answerError ? "answer-error" : undefined}
                  />
                  <button
                      type="button"
                      onClick={onFindDefinition}
                      disabled={isLoading || isFindingDefinition}
                      className="flex-shrink-0 h-[42px] w-[42px] flex items-center justify-center text-stone-600 bg-stone-100 border border-stone-300 rounded-md hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-stone-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Find definition for answer"
                  >
                      {isFindingDefinition ? (
                          <div className="w-5 h-5 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                          <SearchIcon className="w-5 h-5" />
                      )}
                  </button>
              </div>
              {answerError && <p id="answer-error" className="mt-1 text-sm text-red-600">{answerError}</p>}
            </div>
        </InputField>
        <InputField label="Definition" id="definition">
            <div className="relative">
                <input
                    type="text"
                    id="definition"
                    name="definition"
                    value={formData.definition}
                    onChange={onChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-teal-500 transition duration-150 ease-in-out ${definitionError ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-stone-300 focus:ring-teal-500'}`}
                    placeholder="Click the search icon..."
                    required
                    aria-invalid={!!definitionError}
                    aria-describedby={definitionError ? "definition-error" : undefined}
                />
                {definitionError && <p id="definition-error" className="mt-1 text-sm text-red-600">{definitionError}</p>}
            </div>
        </InputField>
      </div>
      
      <InputField label="Wordplay Breakdown (Optional)" id="wordplayBreakdown">
        <textarea
            id="wordplayBreakdown"
            name="wordplayBreakdown"
            value={formData.wordplayBreakdown}
            onChange={onChange}
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
            placeholder="e.g., (NAGS TATE)*. If blank, the AI will invent its own wordplay."
        />
      </InputField>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Cryptic Device" id="crypticDevice">
            <select
                id="crypticDevice"
                name="crypticDevice"
                value={formData.crypticDevice}
                onChange={onChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
            >
            {crypticDevices.map(device => (
                <option key={device} value={device}>{device}</option>
            ))}
            </select>
        </InputField>
        <InputField label="Difficulty" id="difficulty">
            <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={onChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
            >
            {difficultyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
            ))}
            </select>
        </InputField>
        <InputField label="AI Persona" id="persona">
            <select
                id="persona"
                name="persona"
                value={formData.persona}
                onChange={onChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
            >
            {personaTypes.map(persona => (
                <option key={persona} value={persona}>{persona}</option>
            ))}
            </select>
        </InputField>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <div className='flex items-center gap-2'>
          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 text-stone-600 bg-stone-100 border border-stone-300 rounded-md hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
           <button
            type="button"
            onClick={onExample}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 text-white bg-stone-500 rounded-md hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Example
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:bg-teal-400 disabled:cursor-wait"
          >
              {isLoading ? 'Crafting...' : 'Generate (Ctrl+Enter)'}
          </button>
        </div>
      </div>
    </form>
  );
};
