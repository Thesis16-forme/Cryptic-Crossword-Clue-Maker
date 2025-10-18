import React, { useState, useCallback } from 'react';
import { CopyIcon } from './CopyIcon';

interface ClueDisplayProps {
  clue: string;
  setter: string;
  answerLength: number;
}

const ClueDisplay: React.FC<ClueDisplayProps> = ({ clue, setter, answerLength }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const textToCopy = `${clue} (${answerLength})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [clue, answerLength]);

  return (
    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex items-start justify-between space-x-4">
      <div className="flex-grow">
        <p className="text-lg text-gray-200 font-mono">
          {clue} <span className="text-gray-400">({answerLength})</span>
        </p>
        <p className="text-xs text-indigo-300 italic mt-1">Style: {setter}</p>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 rounded-md hover:bg-gray-600 text-gray-400 hover:text-white transition-colors relative flex-shrink-0"
        aria-label="Copy clue"
      >
        <CopyIcon />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
};

export default ClueDisplay;