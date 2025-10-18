import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ClueCard } from './components/ClueCard';
import { Loader } from './components/Loader';
import { type FormData, type Clue, type SavedClue } from './types';
import { generateCrosswordClues, findDefinitions, generateClueVariations } from './services/geminiService';
import { AboutModal } from './components/AboutModal';
import { SavedCluesModal } from './components/SavedCluesModal';
import { ErrorDisplay } from './components/ErrorDisplay';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    answer: '',
    definition: '',
    wordplayBreakdown: '',
    crypticDevice: 'Any',
    difficulty: 'Medium',
    persona: 'Guardian Master Setter',
  });
  const [clues, setClues] = useState<Clue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFindingDefinition, setIsFindingDefinition] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ name: 'submit' | 'definition' | 'variations'; payload?: any } | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isSavedCluesModalOpen, setIsSavedCluesModalOpen] = useState<boolean>(false);
  const [savedClues, setSavedClues] = useState<SavedClue[]>([]);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('crypticClueFormData');
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
      const savedCluesData = localStorage.getItem('crypticSavedClues');
      if (savedCluesData) {
        setSavedClues(JSON.parse(savedCluesData));
      }
    } catch (e) {
      console.error("Failed to parse saved data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('crypticClueFormData', JSON.stringify(formData));
        setSaveMessage('Input saved!');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [formData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'answer' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.answer.trim()) {
      errors.answer = 'Please provide an answer word.';
    }
    if (!formData.definition.trim()) {
      errors.definition = 'Please provide a definition.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const performSubmit = useCallback(async () => {
    if (isLoading) return;
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    setLastAction(null);
    setClues([]);

    try {
      const generatedClues = await generateCrosswordClues(formData);
      const savedClueTexts = new Set(savedClues.map(c => c.clue));
      const cluesWithSavedStatus = generatedClues.map(clue => ({
        ...clue,
        isSaved: savedClueTexts.has(clue.clue),
      }));
      setClues(cluesWithSavedStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setLastAction({ name: 'submit' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading, savedClues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSubmit();
  };
  
  const clearForm = () => {
    setFormData({
      answer: '',
      definition: '',
      wordplayBreakdown: '',
      crypticDevice: 'Any',
      difficulty: 'Medium',
      persona: 'Guardian Master Setter',
    });
    setClues([]);
    setError(null);
    setLastAction(null);
    setValidationErrors({});
    localStorage.removeItem('crypticClueFormData');
  };

  const loadExample = () => {
    setFormData({
      answer: 'STAGNATE',
      definition: 'Stop developing',
      wordplayBreakdown: '(NAGS TATE)*',
      crypticDevice: 'Anagram',
      difficulty: 'Medium',
      persona: 'Guardian Master Setter',
    });
    setClues([]);
    setError(null);
    setLastAction(null);
    setValidationErrors({});
  };

  const performFindDefinition = useCallback(async () => {
    if (!formData.answer.trim()) {
      setValidationErrors({ answer: 'Please provide an answer word to find its definition.' });
      return;
    }

    setIsFindingDefinition(true);
    setError(null);
    setLastAction(null);
    setValidationErrors({});

    try {
        const definition = await findDefinitions(formData.answer);
        setFormData(prev => ({ ...prev, definition }));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while finding the definition.';
        setError(errorMessage);
        setLastAction({ name: 'definition' });
        console.error(err);
    } finally {
        setIsFindingDefinition(false);
    }
  }, [formData.answer]);

  const performGetVariations = useCallback(async (clueIndex: number) => {
    const originalClue = clues[clueIndex];
    if (!originalClue || originalClue.isLoadingVariations) return;

    setClues(prevClues => prevClues.map((c, i) => i === clueIndex ? { ...c, isLoadingVariations: true } : c));
    setError(null);
    setLastAction(null);

    try {
      const variations = await generateClueVariations(originalClue, formData);
      setClues(prevClues => prevClues.map((c, i) => i === clueIndex ? { ...c, variations, isLoadingVariations: false } : c));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while getting variations.';
      setError(errorMessage);
      setLastAction({ name: 'variations', payload: clueIndex });
      console.error(err);
      setClues(prevClues => prevClues.map((c, i) => i === clueIndex ? { ...c, isLoadingVariations: false } : c));
    }
  }, [clues, formData]);

  const handleSaveClue = (clueToSave: Clue) => {
    if (savedClues.some(c => c.clue === clueToSave.clue)) return;

    const newSavedClue: SavedClue = {
      id: `clue-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      clue: clueToSave.clue,
      explanation: clueToSave.explanation,
    };

    const updatedSavedClues = [...savedClues, newSavedClue];
    setSavedClues(updatedSavedClues);
    localStorage.setItem('crypticSavedClues', JSON.stringify(updatedSavedClues));

    setClues(prevClues => prevClues.map(c => 
      c.clue === clueToSave.clue ? { ...c, isSaved: true } : c
    ));
  };

  const handleDeleteClue = (clueId: string) => {
    const clueToDelete = savedClues.find(c => c.id === clueId);
    if (!clueToDelete) return;

    const updatedSavedClues = savedClues.filter(c => c.id !== clueId);
    setSavedClues(updatedSavedClues);
    localStorage.setItem('crypticSavedClues', JSON.stringify(updatedSavedClues));

    setClues(prevClues => prevClues.map(c =>
      c.clue === clueToDelete.clue ? { ...c, isSaved: false } : c
    ));
  };
  
  const handleRetry = () => {
    if (lastAction) {
        const actionToRetry = lastAction;
        setError(null);
        setLastAction(null);
        
        switch(actionToRetry.name) {
            case 'submit':
                performSubmit();
                break;
            case 'definition':
                performFindDefinition();
                break;
            case 'variations':
                performGetVariations(actionToRetry.payload);
                break;
        }
    }
  };

  const handleClearError = () => {
    setError(null);
    setLastAction(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header 
        onAboutClick={() => setIsAboutModalOpen(true)}
        onSavedCluesClick={() => setIsSavedCluesModalOpen(true)}
      />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <p className="mb-8 text-center text-stone-600 font-serif italic text-lg">
          Crafting clues with the wit of Araucaria and the cunning of Enigmatist.
        </p>

        <InputForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onClear={clearForm}
          onExample={loadExample}
          isFindingDefinition={isFindingDefinition}
          onFindDefinition={performFindDefinition}
          errors={validationErrors}
          saveMessage={saveMessage}
        />

        {isLoading && <Loader />}

        {error && (
          <ErrorDisplay
            message={error}
            onRetry={lastAction ? handleRetry : undefined}
            onClear={handleClearError}
          />
        )}

        {clues.length > 0 && (
          <div className="mt-10 pt-8 border-t-2 border-dashed border-stone-300">
            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-6 text-center">Generated Clues</h2>
            <div className="space-y-6">
              {clues.map((clue, index) => (
                <ClueCard 
                  key={index} 
                  clue={clue} 
                  index={index + 1}
                  onGetVariations={() => performGetVariations(index)}
                  onSave={() => handleSaveClue(clue)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-sm text-stone-500">
        <p>Cryptic Clue Craftsman &copy; {new Date().getFullYear()}</p>
      </footer>
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <SavedCluesModal
        isOpen={isSavedCluesModalOpen}
        onClose={() => setIsSavedCluesModalOpen(false)}
        clues={savedClues}
        onDelete={handleDeleteClue}
      />
    </div>
  );
};

export default App;
