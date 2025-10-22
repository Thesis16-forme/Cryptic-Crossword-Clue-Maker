import React, { useState } from 'react';
import { Preset, ClueType } from '../types';
import { SaveIcon } from './SaveIcon';
import { TrashIcon } from './TrashIcon';
import { InfoIcon } from './InfoIcon';

interface PresetManagerProps {
  presets: Preset[];
  onApply: (preset: Preset) => void;
  onAdd: (preset: Preset) => void;
  onDelete: (presetName: string) => void;
  currentSettings: {
    setter: string;
    clueType: ClueType;
    theme: string;
    isToughie: boolean;
  };
  selectedPreset: string;
  setSelectedPreset: (name: string) => void;
  disabled?: boolean;
}

const PresetManager: React.FC<PresetManagerProps> = ({
  presets,
  onApply,
  onAdd,
  onDelete,
  currentSettings,
  selectedPreset,
  setSelectedPreset,
  disabled
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    setSelectedPreset(presetName);
    if (presetName) {
      const presetToApply = presets.find(p => p.name === presetName);
      if (presetToApply) {
        onApply(presetToApply);
      }
    }
  };

  const handleSaveClick = () => {
    setIsSaving(true);
  };

  const handleConfirmSave = () => {
    if (newPresetName.trim()) {
      onAdd({
        name: newPresetName.trim(),
        ...currentSettings
      });
      setSelectedPreset(newPresetName.trim());
      setNewPresetName('');
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedPreset && window.confirm(`Are you sure you want to delete the preset "${selectedPreset}"?`)) {
      onDelete(selectedPreset);
      setSelectedPreset('');
    }
  };

  const presetOptions = [
    { value: '', label: 'Select a preset...' },
    ...presets.map(p => ({ value: p.name, label: p.name }))
  ];

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-[var(--color-border)]">
       <div className="flex items-center justify-between">
        <label htmlFor="preset-select" className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Presets
        </label>
         <div className="relative group" title="Show help">
            <InfoIcon />
            <div
              className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10"
              role="tooltip"
            >
              <p className="font-bold mb-1 text-[var(--color-text-primary)]">Settings Presets</p>
              Save your current combination of Setter, Clue Type, Theme, and 'Toughie' mode for quick access later.
            </div>
          </div>
       </div>

      <div className="flex items-center space-x-2">
        <select
          id="preset-select"
          value={selectedPreset}
          onChange={handleSelectChange}
          disabled={disabled}
          className="flex-grow w-full bg-white border border-[var(--color-border)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition appearance-none bg-no-repeat"
           style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236C757D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
        }}
        >
          {presetOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={!selectedPreset || disabled}
          className="p-2 text-red-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Delete selected preset"
          title="Delete selected preset"
        >
          <TrashIcon />
        </button>
      </div>
      
      {isSaving ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Enter preset name..."
            className="flex-grow bg-white border border-[var(--color-border)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            aria-label="New preset name"
          />
          <button
            type="button"
            onClick={handleConfirmSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-accent)] rounded-md hover:bg-[var(--color-accent-hover)]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsSaving(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={disabled}
          className="w-full flex justify-center items-center space-x-2 text-sm font-medium text-[var(--color-accent)] bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SaveIcon />
          <span>Save Current Settings as Preset</span>
        </button>
      )}
    </div>
  );
};

export default PresetManager;