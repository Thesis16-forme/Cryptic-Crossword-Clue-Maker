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

export interface FormData {
  answer: string;
  definition: string;
  wordplayBreakdown: string;
  crypticDevice: CrypticDevice;
  difficulty: Difficulty;
}

export interface Clue {
  clue: string;
  explanation: string;
  variations?: Clue[];
  isLoadingVariations?: boolean;
}