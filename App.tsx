import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ClueCard } from './components/ClueCard';
import { Loader } from './components/Loader';
import { type FormData, type Clue } from './types';
import { generateCrosswordClues, findDefinitions, generateClueVariations } from './services/geminiService';
import { AboutModal } from './components/AboutModal';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    answer: '',
    definition: '',
    wordplayBreakdown: '',
    crypticDevice: 'Any',
    difficulty: 'Medium',
  });
  const [clues, setClues] = useState<Clue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFindingDefinition, setIsFindingDefinition] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('crypticClueFormData');
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("Failed to parse saved form data from localStorage", e);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    setClues([]);

    try {
      const generatedClues = await generateCrosswordClues(formData);
      setClues(generatedClues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearForm = () => {
    setFormData({
      answer: '',
      definition: '',
      wordplayBreakdown: '',
      crypticDevice: 'Any',
      difficulty: 'Medium',
    });
    setClues([]);
    setError(null);
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
    });
    setClues([]);
    setError(null);
    setValidationErrors({});
  };

  const handleFindDefinition = async () => {
    if (!formData.answer.trim()) {
      setValidationErrors({ answer: 'Please provide an answer word to find its definition.' });
      return;
    }

    setIsFindingDefinition(true);
    setError(null);
    setValidationErrors({});

    try {
        const definition = await findDefinitions(formData.answer);
        setFormData(prev => ({ ...prev, definition }));
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while finding the definition.');
        console.error(err);
    } finally {
        setIsFindingDefinition(false);
    }
  };

  const handleGetVariations = async (clueIndex: number) => {
    const originalClue = clues[clueIndex];
    if (!originalClue || originalClue.isLoadingVariations) return;

    setClues(prevClues => prevClues.map((c, i) => i === clueIndex ? { ...c, isLoadingVariations: true } : c));
    setError(null);

    try {
      const variations = await generateClueVariations(originalClue, formData);
      setClues(prevClues => prevClues.map((c, i) => i === clueIndex ? { ...c, variations, isLoadingVariations: false } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while getting variations.');
      console.error(err);
      setClues(prevClues => prevClues.map((c, i) => i === clueIndex ? { ...c, isLoadingVariations: false } : c));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header onAboutClick={() => setIsAboutModalOpen(true)} />
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
          onFindDefinition={handleFindDefinition}
          errors={validationErrors}
          saveMessage={saveMessage}
        />

        {isLoading && <Loader />}

        {error && (
          <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-4 text-center text-red-700">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
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
                  onGetVariations={() => handleGetVariations(index)} 
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
    </div>
  );
};

export default App;