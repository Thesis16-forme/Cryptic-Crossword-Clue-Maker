export enum ClueType {
  ANY = 'ANY',
  ANAGRAM = 'ANAGRAM',
  CHARADE = 'CHARADE',
  CONTAINER = 'CONTAINER',
  REVERSAL = 'REVERSAL',
  HOMOPHONE = 'HOMOPHONE',
  DOUBLE_DEFINITION = 'DOUBLE_DEFINITION',
  DELETION = 'DELETION',
  PALINDROME = 'PALINDROME',
  HIDDEN_WORD = 'HIDDEN_WORD',
  LITERAL = 'LITERAL',
  COMPOSITE = 'COMPOSITE',
  SPOONERISM = 'SPOONERISM',
  CRYPTIC_DEFINITION = 'CRYPTIC_DEFINITION',
  INITIALISM = 'INITIALISM',
}

export interface GeneratedClue {
  clue: string;
  setter: string;
}

export interface HistoryEntry {
  id: number;
  clue: string;
  answer: string;
  definition: string;
  clueType: ClueType;
  timestamp: number;
  setter?: string;
  theme?: string;
}
