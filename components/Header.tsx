import React from 'react';
import { QuestionCircleIcon } from './QuestionCircleIcon';

interface HeaderProps {
  onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  return (
    <header className="text-center relative">
      <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl sm:text-5xl font-bold text-[var(--color-primary)]">
        Cryptic Clue Constructor
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
        Generate clever cryptic crossword clues with the power of AI.
      </p>
      <button
        onClick={onHelpClick}
        className="absolute top-0 right-0 p-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors duration-200"
        aria-label="Show tutorial"
        title="Show tutorial"
      >
        <QuestionCircleIcon />
      </button>
    </header>
  );
};

export default Header;