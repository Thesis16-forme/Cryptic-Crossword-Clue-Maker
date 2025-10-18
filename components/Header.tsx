import React from 'react';
import { PencilIcon } from './icons/PencilIcon';
import { InfoIcon } from './icons/InfoIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface HeaderProps {
  onAboutClick: () => void;
  onSavedCluesClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAboutClick, onSavedCluesClick }) => {
  return (
    <header className="bg-stone-800 text-white shadow-md">
      <div className="container mx-auto max-w-4xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <PencilIcon className="h-8 w-8 text-stone-300" />
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide">
            Cryptic Clue Craftsman
            </h1>
        </div>
        <div className="flex items-center space-x-2">
            <button
            onClick={onSavedCluesClick}
            className="p-2 rounded-full hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-white transition-colors"
            aria-label="View saved clues"
            >
            <BookmarkIcon className="h-6 w-6 text-stone-300" />
            </button>
            <button
            onClick={onAboutClick}
            className="p-2 rounded-full hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-white transition-colors"
            aria-label="About this application"
            >
            <InfoIcon className="h-6 w-6 text-stone-300" />
            </button>
        </div>
      </div>
    </header>
  );
};
