import React from 'react';
import { type Clue } from '../types';

interface ClueCardProps {
  clue: Clue;
  index: number;
  onGetVariations: () => void;
}

const VariationCard: React.FC<{clue: Clue, index: number}> = ({ clue, index }) => {
  return (
    <div className="ml-4 pl-4 border-l-2 border-stone-200 py-2">
      <p className="text-md font-serif italic text-stone-700">
        {`v${index}: ${clue.clue}`}
      </p>
      <p className="mt-1 text-xs text-stone-500 leading-relaxed">
        <span className="font-bold text-stone-600">Parsing: </span>{clue.explanation}
      </p>
    </div>
  )
}

export const ClueCard: React.FC<ClueCardProps> = ({ clue, index, onGetVariations }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-stone-200 transition-shadow hover:shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-stone-800 text-white font-bold font-serif rounded-full">
          {index}
        </div>
        <div className="flex-grow">
          <p className="text-lg font-serif italic text-stone-800">
            {clue.clue}
          </p>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            <span className="font-bold text-stone-700">Parsing: </span>{clue.explanation}
          </p>
        </div>
      </div>

      {clue.variations && clue.variations.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="font-bold font-serif text-stone-700 text-sm">Variations:</h4>
          {clue.variations.map((variation, vIndex) => (
            <VariationCard key={vIndex} clue={variation} index={vIndex + 1} />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onGetVariations}
          disabled={clue.isLoadingVariations}
          className="px-4 py-1 text-xs text-white bg-stone-500 rounded-md hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {clue.isLoadingVariations ? 'Generating...' : 'Get Variations'}
        </button>
      </div>
    </div>
  );
};