import React, { useState, useCallback, useEffect } from 'react';
import { ClueType, GeneratedClue } from './types';
import { generateClue, getClueTypeExplanation, getSetterExplanation, getMetadata } from './services/geminiService';
import { useHistory } from './hooks/useHistory';
import Header from './components/Header';
import TextInput from './components/TextInput';
import SelectInput from './components/SelectInput';
import Button from './components/Button';
import ClueDisplay from './components/ClueDisplay';
import Spinner from './components/Spinner';
import HistoryDisplay from './components/HistoryDisplay';
import { HistoryIcon } from './components/HistoryIcon';
import ErrorDisplay from './components/ErrorDisplay';

const MAX_ANSWER_LENGTH = 25;
const MAX_DEFINITION_LENGTH = 80;

const App: React.FC = () => {
  const [answer, setAnswer] = useState<string>('');
  const [definition, setDefinition] = useState<string>('');
  const [clueType, setClueType] = useState<ClueType>(ClueType.ANAGRAM);
  const [setters, setSetters] = useState<string[]>([]);
  const [setter, setSetter] = useState<string>('');
  const [generatedClue, setGeneratedClue] = useState<GeneratedClue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isToughie, setIsToughie] = useState<boolean>(false);
  const [history, addHistoryEntry, clearHistory] = useHistory();
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchSetters = async () => {
        try {
            const metadata = await getMetadata();
            setSetters(metadata.setters);
            if (metadata.setters.length > 0) {
                // Default to 'Paul' if available, otherwise the first in the list
                setSetter(metadata.setters.find(s => s === 'Paul') || metadata.setters[0]);
            }
        } catch (e) {
            console.error("Failed to load setters", e);
            setError("Could not load setter styles. Please refresh the page.");
        }
    };
    fetchSetters();
  }, []);

  const clueTypeOptions = Object.values(ClueType).map(value => ({
    value,
    label: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  const setterOptions = setters.map(s => ({ value: s, label: s }));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !definition) {
      setError('Please provide both an answer and a definition.');
      return;
    }
    if (!setter) {
        setError('Please select a setter style.');
        return;
    }
    if (answer.length > MAX_ANSWER_LENGTH) {
        setError(`The answer cannot be longer than ${MAX_ANSWER_LENGTH} characters.`);
        return;
    }
    if (definition.length > MAX_DEFINITION_LENGTH) {
        setError(`The definition cannot be longer than ${MAX_DEFINITION_LENGTH} characters.`);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedClue(null);

    try {
      const clueObject = await generateClue(answer, definition, clueType, isToughie, setter);
      setGeneratedClue(clueObject);
      addHistoryEntry({
        clue: clueObject.clue,
        answer,
        definition,
        clueType,
        setter: clueObject.setter,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [answer, definition, clueType, isToughie, setter, addHistoryEntry]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <Header />
        <main className="mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm bg-opacity-70 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              id="answer"
              label="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g., PLANET"
              required
              maxLength={MAX_ANSWER_LENGTH}
            />
            <TextInput
              id="definition"
              label="Definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="e.g., Celestial body"
              required
              maxLength={MAX_DEFINITION_LENGTH}
            />
            <SelectInput
              id="clueType"
              label="Clue Type"
              value={clueType}
              onChange={(e) => setClueType(e.target.value as ClueType)}
              options={clueTypeOptions}
              infoText={getClueTypeExplanation(clueType)}
            />
            <SelectInput
              id="setter"
              label="Setter Style"
              value={setter}
              onChange={(e) => setSetter(e.target.value)}
              options={setterOptions}
              infoText={getSetterExplanation(setter)}
            />
             <div className="flex items-center justify-end pt-2">
                <label htmlFor="toughie" className="mr-3 block text-sm font-medium text-gray-300">
                    Toughie Mode (more challenging)
                </label>
                <input
                    id="toughie"
                    type="checkbox"
                    checked={isToughie}
                    onChange={(e) => setIsToughie(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 text-indigo-600 focus:ring-indigo-500 bg-gray-700 cursor-pointer"
                />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Generate Clue'}
            </Button>
          </form>

          {error && <ErrorDisplay errorMessage={error} onDismiss={() => setError(null)} />}
          
          {generatedClue && (
             <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-center text-indigo-300 mb-4">Generated Clue</h2>
                <ClueDisplay 
                    clue={generatedClue.clue} 
                    setter={generatedClue.setter} 
                    answerLength={answer.length} 
                />
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center">
                  <button
                      onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                      className="inline-flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-700/50"
                      aria-expanded={isHistoryVisible}
                      aria-controls="history-section"
                  >
                      <HistoryIcon />
                      <span>{isHistoryVisible ? 'Hide History' : 'Show History'} ({history.length})</span>
                  </button>
              </div>
            </div>
          )}

          {isHistoryVisible && history.length > 0 && (
              <div id="history-section" className="mt-6">
                  <HistoryDisplay history={history} onClear={clearHistory} />
              </div>
          )}

        </main>
      </div>
       <footer className="w-full max-w-2xl mx-auto text-center mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini. For entertainment purposes only.</p>
      </footer>
    </div>
  );
};

export default App;