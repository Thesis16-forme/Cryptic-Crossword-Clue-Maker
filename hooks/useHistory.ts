import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry, ClueType } from '../types';

const HISTORY_STORAGE_KEY = 'crypticClueHistory';

const now = Date.now();
const exampleHistoryEntries: HistoryEntry[] = [
    {
        id: now,
        clue: 'Silent rearrangement to pay attention',
        answer: 'LISTEN',
        definition: 'Pay attention',
        clueType: ClueType.ANAGRAM,
        timestamp: now,
        setter: 'Araucaria',
    },
    {
        id: now - 1,
        clue: "Vehicle's companion is a floor covering",
        answer: 'CARPET',
        definition: 'Floor covering',
        clueType: ClueType.CHARADE,
        timestamp: now - 1,
        setter: 'Rufus',
    },
    {
        id: now - 2,
        clue: 'Royal Academician in rubbish container provides mind',
        answer: 'BRAIN',
        definition: 'Mind',
        clueType: ClueType.CONTAINER,
        timestamp: now - 2,
        setter: 'Ximenes',
    },
    {
        id: now - 3,
        clue: 'A game to start a fire',
        answer: 'MATCH',
        definition: 'Game or light',
        clueType: ClueType.DOUBLE_DEFINITION,
        timestamp: now - 3,
        setter: 'Pasquale',
    },
    {
        id: now - 4,
        clue: "Reverend's melted butter becomes a quiet complaint that's been struck",
        answer: 'BELTED MUTTER',
        definition: 'Struck quiet complaint',
        clueType: ClueType.SPOONERISM,
        timestamp: now - 4,
        setter: 'Bunthorne',
    },
];

export const useHistory = (): [HistoryEntry[], (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void, () => void] => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory(exampleHistoryEntries);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(exampleHistoryEntries));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  const addHistoryEntry = useCallback((entryData: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entryData,
      id: Date.now(),
      timestamp: Date.now(),
    };

    setHistory(prevHistory => {
      const updatedHistory = [newEntry, ...prevHistory];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  }, []);
  
  const clearHistory = useCallback(() => {
    const confirmClear = window.confirm("Are you sure you want to clear all clue history? This action cannot be undone.");
    if (confirmClear) {
        setHistory([]);
        try {
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear history from localStorage", error);
        }
    }
  }, []);

  return [history, addHistoryEntry, clearHistory];
};