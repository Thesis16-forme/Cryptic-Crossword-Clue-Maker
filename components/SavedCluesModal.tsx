import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { type SavedClue } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SavedCluesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clues: SavedClue[];
  onDelete: (id: string) => void;
}

export const SavedCluesModal: React.FC<SavedCluesModalProps> = ({ isOpen, onClose, clues, onDelete }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleCopy = (clue: SavedClue) => {
    const textToCopy = `${clue.clue}\n\nPARSING: ${clue.explanation}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(clue.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      aria-labelledby="saved-clues-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="p-6 sm:p-8 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 id="saved-clues-modal-title" className="text-2xl font-serif font-bold text-stone-800">
            Saved Clues
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto">
          {clues.length > 0 ? (
            <ul className="space-y-4">
              {clues.map((clue) => (
                <li key={clue.id} className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                  <p className="font-serif italic text-stone-800">{clue.clue}</p>
                  <p className="mt-2 text-sm text-stone-600">
                    <span className="font-bold">Parsing: </span>{clue.explanation}
                  </p>
                  <div className="mt-3 flex justify-end items-center gap-2">
                    <button
                      onClick={() => handleCopy(clue)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs text-stone-600 bg-stone-200 rounded-md hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-stone-400 transition-colors"
                      aria-label="Copy clue and parsing"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span>{copiedId === clue.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onDelete(clue.id)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition-colors"
                      aria-label="Delete clue"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-stone-500 italic">You have no saved clues yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
