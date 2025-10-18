import React from 'react';
import { HistoryEntry } from '../types';
import { TrashIcon } from './TrashIcon';

interface HistoryDisplayProps {
  history: HistoryEntry[];
  onClear: () => void;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onClear }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatClueType = (clueType: string) => {
    return clueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-indigo-300">Clue History</h2>
        <button
          onClick={onClear}
          className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition-colors bg-red-900/50 hover:bg-red-900/80 px-3 py-1 rounded-md"
          aria-label="Clear history"
        >
          <TrashIcon />
          <span>Clear</span>
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-4 custom-scrollbar">
        {history.map((entry) => (
          <div key={entry.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 animate-fade-in">
            <p className="text-lg text-gray-200 font-mono">
              {entry.clue} <span className="text-gray-400">({entry.answer.length})</span>
            </p>
            {entry.setter && (
              <p className="text-xs text-indigo-300 italic mt-1">Style: {entry.setter}</p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-600 text-sm text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <p><span className="font-semibold text-gray-300">Answer:</span> {entry.answer.toUpperCase()}</p>
              <p><span className="font-semibold text-gray-300">Type:</span> {formatClueType(entry.clueType)}</p>
              <p className="sm:col-span-2"><span className="font-semibold text-gray-300">Definition:</span> {entry.definition}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-right">{formatTimestamp(entry.timestamp)}</p>
          </div>
        ))}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #2d3748; /* gray-800 */
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5568; /* gray-600 */
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096; /* gray-500 */
        }
      `}</style>
    </div>
  );
};

export default HistoryDisplay;