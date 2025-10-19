import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl sm:text-5xl font-bold text-[var(--color-primary)]">
        Cryptic Clue Constructor
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
        Generate clever cryptic crossword clues with the power of AI.
      </p>
    </header>
  );
};

export default Header;