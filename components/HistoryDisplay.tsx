import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import { TrashIcon } from './TrashIcon';

interface HistoryDisplayProps {
  history: HistoryEntry[];
  onClear: () => void;
}

const CopyAllIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onClear }) => {
  const [isAllCopied, setIsAllCopied] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatClueType = (clueType: string) => {
    return clueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const handleCopyAll = () => {
    if (history.length === 0) return;

    const formattedHistory = history
      .slice() // Create a copy to avoid modifying the original
      .reverse() // Format in chronological order
      .map(entry => {
        const themeLine = entry.theme ? `Theme: ${entry.theme}` : '';
        return [
          `Clue: ${entry.clue} (${entry.answer.length})`,
          `Answer: ${entry.answer.toUpperCase()}`,
          `Definition: ${entry.definition}`,
          `Type: ${formatClueType(entry.clueType)}`,
          `Setter: ${entry.setter}`,
          themeLine,
        ].filter(Boolean).join('\n');
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(formattedHistory).then(() => {
        setIsAllCopied(true);
        setTimeout(() => setIsAllCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Clue History</h2>
        <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAll}
              disabled={history.length === 0}
              className="relative flex items-center space-x-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-all duration-200 transform hover:scale-105 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-[var(--color-border)]"
              aria-label="Copy all clues to clipboard"
              title="Copy all clues to clipboard"
            >
              <CopyAllIcon />
              <span>Copy All</span>
               {isAllCopied && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-4 custom-scrollbar">
        {history.map((entry, index) => (
          <div 
            key={entry.id} 
            className="bg-slate-50 p-4 rounded-lg border border-[var(--color-border)] animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <p className="text-lg text-[var(--color-text-primary)] font-mono">
              {entry.clue} <span className="text-[var(--color-text-secondary)]">({entry.answer.length})</span>
            </p>
            {entry.setter && (
              <p className="text-xs text-[var(--color-accent)] italic mt-1">Style: {entry.setter}</p>
            )}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Answer:</span> {entry.answer.toUpperCase()}</p>
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Type:</span> {formatClueType(entry.clueType)}</p>
                    {entry.theme && (
                        <p className="sm:col-span-2"><span className="font-semibold text-[var(--color-text-primary)]">Theme:</span> {entry.theme}</p>
                    )}
                </div>
                <p><span className="font-semibold text-[var(--color-text-primary)]">Definition:</span> {entry.definition}</p>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-right">{formatTimestamp(entry.timestamp)}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 mt-2 border-t border-[var(--color-border)] flex justify-center">
        <button
          onClick={onClear}
          className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition-all duration-200 transform hover:scale-105 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-md border border-red-200"
          aria-label="Clear all history"
          title="Clear all history"
        >
          <TrashIcon />
          <span>Clear All History</span>
        </button>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
          animation-fill-mode: backwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #e9ecef;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ced4da;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #adb5bd;
        }
      `}</style>
    </div>
  );
};

export default HistoryDisplay;