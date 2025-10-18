export type CrypticDevice = 
  | 'Any'
  | 'Anagram'
  | 'Charade'
  | 'Container'
  | 'Reversal'
  | 'Hidden Word'
  | 'Homophone'
  | 'Deletion'
  | 'Double Definition'
  | 'Cryptic Definition'
  | '& Lit.'
  | 'Palindrome';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Persona = 'Guardian Master Setter' | 'Witty Punster' | 'Concise Ximenean';

export interface FormData {
  answer: string;
  definition: string;
  wordplayBreakdown: string;
  crypticDevice: CrypticDevice;
  difficulty: Difficulty;
  persona: Persona;
}

export interface Clue {
  clue: string;
  explanation: string;
  variations?: Clue[];
  isLoadingVariations?: boolean;
  isSaved?: boolean;
}

export interface SavedClue {
  id: string;
  clue: string;
  explanation: string;
}
