import { useState, useEffect, useCallback } from 'react';
// FIX: Import ClueType to use its enum members.
import { Preset, ClueType } from '../types';

const PRESETS_STORAGE_KEY = 'crypticCluePresets';

// Example presets for new users
const examplePresets: Preset[] = [
    {
        name: 'Witty & Modern (Paul)',
        setter: 'Paul',
        // FIX: Use ClueType enum member instead of a string literal.
        clueType: ClueType.ANY,
        theme: 'None',
        isToughie: false,
    },
    {
        name: 'Beginner Friendly (Rufus)',
        setter: 'Rufus',
        // FIX: Use ClueType enum member instead of a string literal.
        clueType: ClueType.DOUBLE_DEFINITION,
        theme: 'None',
        isToughie: false,
    },
     {
        name: 'Classic & Precise (Ximenes)',
        setter: 'Ximenes',
        // FIX: Use ClueType enum member instead of a string literal.
        clueType: ClueType.CHARADE,
        theme: 'None',
        isToughie: true,
    }
];

export const usePresets = (): [Preset[], (preset: Preset) => void, (presetName: string) => void] => {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      } else {
        // Load example presets for first-time users
        setPresets(examplePresets);
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(examplePresets));
      }
    } catch (error) {
      console.error("Failed to load presets from localStorage", error);
      localStorage.removeItem(PRESETS_STORAGE_KEY);
    }
  }, []);

  const addPreset = useCallback((preset: Preset) => {
    setPresets(prevPresets => {
      // Check if a preset with the same name already exists and replace it
      const existingIndex = prevPresets.findIndex(p => p.name === preset.name);
      let updatedPresets;
      if (existingIndex > -1) {
        updatedPresets = [...prevPresets];
        updatedPresets[existingIndex] = preset;
      } else {
        updatedPresets = [...prevPresets, preset];
      }
      
      try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
      } catch (error) {
        console.error("Failed to save presets to localStorage", error);
      }
      return updatedPresets;
    });
  }, []);
  
  const deletePreset = useCallback((presetName: string) => {
    setPresets(prevPresets => {
      const updatedPresets = prevPresets.filter(p => p.name !== presetName);
      try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
      } catch (error) {
        console.error("Failed to update presets in localStorage", error);
      }
      return updatedPresets;
    });
  }, []);

  return [presets, addPreset, deletePreset];
};