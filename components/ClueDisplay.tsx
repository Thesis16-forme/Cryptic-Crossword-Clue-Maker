import React, { useState, useCallback, useEffect } from 'react';
import { CopyIcon } from '../CopyIcon';
import { EditIcon } from './EditIcon';

interface ClueDisplayProps {
  clue: string;
  setter: string;
  answerLength: number;
}

const ClueDisplay: React.FC<ClueDisplayProps> = ({ clue, setter, answerLength }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClue, setEditedClue] = useState(clue);

  // When a new clue prop is received from the parent, reset the component's state
  useEffect(() => {
    setEditedClue(clue);
    setIsEditing(false);
  }, [clue]);

  const handleCopy = useCallback(() => {
    // Copy the potentially edited clue
    const textToCopy = `${editedClue} (${answerLength})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [editedClue, answerLength]);

  const handleSave = () => {
    setIsEditing(false);
    // The editedClue state is already up-to-date
  };

  const handleCancel = () => {
    setEditedClue(clue); // Revert changes
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-slate-100 p-4 rounded-lg border border-[var(--color-border)] space-y-4">
        <textarea
          value={editedClue}
          onChange={(e) => setEditedClue(e.target.value)}
          className="w-full bg-white border border-[var(--color-border)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition font-mono"
          rows={3}
          aria-label="Edit clue text"
        />
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-accent)] border border-transparent rounded-md shadow-sm hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)]"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 p-4 rounded-lg border border-[var(--color-border)] flex items-start justify-between space-x-4">
      <div className="flex-grow">
        <p className="text-lg text-[var(--color-text-primary)] font-mono">
          {editedClue} <span className="text-[var(--color-text-secondary)]">({answerLength})</span>
        </p>
        <p className="text-xs text-[var(--color-accent)] italic mt-1">Style: {setter}</p>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded-md hover:bg-slate-200 text-gray-500 hover:text-[var(--color-accent)] transition-all duration-200 transform hover:scale-110"
          aria-label="Edit clue"
          title="Edit clue"
        >
          <EditIcon />
        </button>
        <button
          onClick={handleCopy}
          className="p-2 rounded-md hover:bg-slate-200 text-gray-500 hover:text-[var(--color-accent)] transition-all duration-200 transform hover:scale-110 relative"
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
    </div>
  );
};

export default ClueDisplay;
