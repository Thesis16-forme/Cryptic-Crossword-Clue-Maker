import React, { useState, useCallback } from 'react';
import { CopyIcon } from '../CopyIcon';

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
    <div className="bg-slate-100 p-4 rounded-lg border border-[var(--color-border)] flex items-start justify-between space-x-4">
      <div className="flex-grow">
        <p className="text-lg text-[var(--color-text-primary)] font-mono">
          {clue} <span className="text-[var(--color-text-secondary)]">({answerLength})</span>
        </p>
        <p className="text-xs text-[var(--color-accent)] italic mt-1">Style: {setter}</p>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 rounded-md hover:bg-slate-200 text-gray-500 hover:text-[var(--color-accent)] transition-all duration-200 transform hover:scale-110 relative flex-shrink-0"
        aria-label="Copy clue"
        title="Copy clue"
      >
        <CopyIcon />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded-md">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
};

export default ClueDisplay;