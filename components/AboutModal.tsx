import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const clueTypes = {
  'Anagram': 'Letters of a word or phrase are rearranged. Indicated by words like "messy", "broken", "wild".',
  'Charade': 'The answer is built from smaller words joined together (e.g., CAR + PET).',
  'Container': 'One word is placed inside another (e.g., IN inside DINGO for DINGO).',
  'Reversal': 'A word is spelled backwards. Indicated by "up" (in down clues), "returned", "reflected".',
  'Hidden Word': 'The answer is hidden within a phrase in the clue (e.g., "bEER in glass").',
  'Homophone': 'A word that sounds like the answer. Indicated by "we hear", "reportedly", "on the radio".',
  'Deletion': 'Letters are removed from a word (e.g., START without its first letter is TART).',
  'Double Definition': 'Two straight definitions for the same word.',
  'Cryptic Definition': 'A purely witty or misleading definition, often with a "?". (e.g., "Flower of London?" for THAMES).',
  '& Lit.': 'The entire clue is both the wordplay and the definition, often with a "!".'
};

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      aria-labelledby="about-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="p-6 sm:p-8 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 id="about-modal-title" className="text-2xl font-serif font-bold text-stone-800">
            About Cryptic Clue Craftsman
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 sm:p-8 space-y-6 text-stone-700">
          <section>
            <h3 className="font-bold font-serif text-lg text-stone-800 mb-2">Purpose</h3>
            <p>
              This tool is a creative partner for cryptic crossword enthusiasts and setters. It uses a powerful AI model, imbued with the persona of a master setter from The Guardian newspaper, to generate high-quality, witty, and varied cryptic clues based on your inputs.
            </p>
          </section>
          <section>
            <h3 className="font-bold font-serif text-lg text-stone-800 mb-2">The Setter's Persona</h3>
            <p>
              The AI adopts the style of legendary setters like Araucaria, Enigmatist, and Paul. It values clever, misleading surface readings and witty wordplay above rigid, dogmatic rules. The goal is to produce clues that are not just technically sound, but also amusing, culturally savvy, and a joy to solve, culminating in that satisfying "Aha!" moment.
            </p>
          </section>
          <section>
            <h3 className="font-bold font-serif text-lg text-stone-800 mb-2">A Brief Guide to Clue Types</h3>
            <div className="space-y-3">
              {Object.entries(clueTypes).map(([type, description]) => (
                <div key={type}>
                  <dt className="font-bold text-stone-800">{type}</dt>
                  <dd className="text-sm text-stone-600 ml-1">{description}</dd>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
