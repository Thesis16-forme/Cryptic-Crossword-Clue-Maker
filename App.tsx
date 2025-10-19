
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ClueType, GeneratedClue } from './types';
import { generateClue, getClueTypeExplanation, getSetterExplanation, getMetadata, getSynonyms } from './services/geminiService';
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
import SuggestionDisplay from './components/SuggestionDisplay';
import { InfoIcon } from './components/InfoIcon';

const MAX_ANSWER_LENGTH = 25;
const MAX_DEFINITION_LENGTH = 80;
const MAX_THEME_LENGTH = 50;

const App: React.FC = () => {
  const [answer, setAnswer] = useState<string>('');
  const [definition, setDefinition] = useState<string>('');
  const [clueType, setClueType] = useState<ClueType>(ClueType.ANY);
  const [setters, setSetters] = useState<string[]>([]);
  const [setter, setSetter] = useState<string>('');
  const [theme, setTheme] = useState<string>('None');
  const [customTheme, setCustomTheme] = useState<string>('');
  const [generatedClue, setGeneratedClue] = useState<GeneratedClue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCoolingDown, setIsCoolingDown] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isToughie, setIsToughie] = useState<boolean>(false);
  const [history, addHistoryEntry, clearHistory] = useHistory();
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

  // State for synonym suggestions
  const [synonymSuggestions, setSynonymSuggestions] = useState<string[]>([]);
  const [isSynonymLoading, setIsSynonymLoading] = useState<boolean>(false);
  const [suggestionTarget, setSuggestionTarget] = useState<'answer' | 'definition' | null>(null);
  const [synonymCache, setSynonymCache] = useState<Record<string, string[]>>({});
  const [highlightedInput, setHighlightedInput] = useState<'answer' | 'definition' | null>(null);


  const answerSuggestionRef = useRef<HTMLDivElement>(null);
  const definitionSuggestionRef = useRef<HTMLDivElement>(null);


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

  const handleDismissSuggestions = useCallback(() => {
    setSuggestionTarget(null);
    setSynonymSuggestions([]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const isClickInAnswer = answerSuggestionRef.current?.contains(event.target as Node);
        const isClickInDefinition = definitionSuggestionRef.current?.contains(event.target as Node);

        if (!isClickInAnswer && !isClickInDefinition) {
            handleDismissSuggestions();
        }
    };

    if (suggestionTarget) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [suggestionTarget, handleDismissSuggestions]);

  const handleSuggestSynonyms = useCallback(async (target: 'answer' | 'definition') => {
    const textToSuggest = target === 'answer' ? answer : definition;
    if (!textToSuggest.trim()) return;

    if (isCoolingDown || isSynonymLoading) return;

    if (suggestionTarget === target) {
        setSuggestionTarget(null);
        setSynonymSuggestions([]);
        return;
    }
    
    setSuggestionTarget(target);
    setSynonymSuggestions([]);
    setIsSynonymLoading(true);

    const cacheKey = textToSuggest.toLowerCase();
    if (synonymCache[cacheKey]) {
        setSynonymSuggestions(synonymCache[cacheKey]);
        setIsSynonymLoading(false);
        return;
    }

    try {
        const synonyms = await getSynonyms(textToSuggest);
        setSynonymSuggestions(synonyms);
        setSynonymCache(prev => ({ ...prev, [cacheKey]: synonyms }));
    } catch (e) {
        if (e instanceof Error) {
            setError(`Synonym Suggestion Error: ${e.message}`);
        } else {
            setError("An unknown error occurred while fetching synonyms.");
        }
        setSuggestionTarget(null);
    } finally {
        setIsSynonymLoading(false);
    }
  }, [answer, definition, suggestionTarget, isCoolingDown, isSynonymLoading, synonymCache]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isCoolingDown) return;

    if (!answer.trim() || !definition.trim()) {
        setError("Please provide both an answer and a definition.");
        return;
    }

    if (answer.length > MAX_ANSWER_LENGTH) {
        setError(`Answer cannot exceed ${MAX_ANSWER_LENGTH} characters.`);
        return;
    }
    if (definition.length > MAX_DEFINITION_LENGTH) {
        setError(`Definition cannot exceed ${MAX_DEFINITION_LENGTH} characters.`);
        return;
    }
    const currentTheme = theme === 'Custom' ? customTheme : theme;
     if (currentTheme.length > MAX_THEME_LENGTH) {
        setError(`Theme cannot exceed ${MAX_THEME_LENGTH} characters.`);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedClue(null);
    handleDismissSuggestions();

    try {
      const result = await generateClue(answer, definition, clueType, isToughie, setter, currentTheme);
      setGeneratedClue(result);
      addHistoryEntry({
        clue: result.clue,
        answer: answer,
        definition: definition,
        clueType: clueType,
        setter: result.setter,
        theme: (currentTheme && currentTheme !== 'None') ? currentTheme : undefined
      });
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while fetching the clue.");
      }
    } finally {
      setIsLoading(false);
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), 2000); // 2 second cooldown
    }
  };

  const clueTypeOptions = Object.values(ClueType).map(ct => ({
    value: ct,
    label: ct.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const setterOptions = setters.map(s => ({ value: s, label: s }));

  const themeOptions = [
    { value: 'None', label: 'None' },
    { value: 'Food', label: 'Food' },
    { value: 'Science', label: 'Science' },
    { value: 'History', label: 'History' },
    { value: 'Music', label: 'Music' },
    { value: 'Sport', label: 'Sport' },
    { value: 'Politics', label: 'Politics' },
    { value: 'Literature', label: 'Literature' },
    { value: 'Custom', label: 'Custom...' }
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Header />

        <div className="relative mt-8">
          <button
            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
            className="absolute -top-12 right-0 flex items-center space-x-2 text-sm text-indigo-300 hover:text-indigo-200 transition-all duration-200 transform hover:scale-105"
            aria-label={isHistoryVisible ? "Hide history" : "Show history"}
            title={isHistoryVisible ? "Hide history" : "Show history"}
          >
            <HistoryIcon />
            <span>History</span>
          </button>
        </div>

        {isHistoryVisible ? (
          <div className="mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm bg-opacity-70 border border-gray-700">
            <HistoryDisplay history={history} onClear={clearHistory} />
          </div>
        ) : (
          <main className="mt-8 bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm bg-opacity-70 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div ref={answerSuggestionRef}>
                <TextInput
                  label="Answer"
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  maxLength={MAX_ANSWER_LENGTH}
                  placeholder="e.g., LISTEN"
                  disabled={isLoading}
                  onSuggestClick={() => handleSuggestSynonyms('answer')}
                  isSuggestLoading={isSynonymLoading && suggestionTarget === 'answer'}
                  isHighlighted={highlightedInput === 'answer'}
                />
                {suggestionTarget === 'answer' && (
                    <SuggestionDisplay
                        suggestions={synonymSuggestions}
                        isLoading={isSynonymLoading}
                        onSuggestionClick={(suggestion) => {
                            setAnswer(suggestion);
                            setHighlightedInput('answer');
                            setTimeout(() => setHighlightedInput(null), 1000);
                            handleDismissSuggestions();
                        }}
                        onDismiss={handleDismissSuggestions}
                        targetLabel={answer}
                    />
                )}
              </div>
             
              <div ref={definitionSuggestionRef}>
                <TextInput
                  label="Definition"
                  id="definition"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  maxLength={MAX_DEFINITION_LENGTH}
                  placeholder="e.g., Pay attention"
                  disabled={isLoading}
                   onSuggestClick={() => handleSuggestSynonyms('definition')}
                  isSuggestLoading={isSynonymLoading && suggestionTarget === 'definition'}
                  isHighlighted={highlightedInput === 'definition'}
                />
                 {suggestionTarget === 'definition' && (
                    <SuggestionDisplay
                        suggestions={synonymSuggestions}
                        isLoading={isSynonymLoading}
                        onSuggestionClick={(suggestion) => {
                            setDefinition(suggestion);
                            setHighlightedInput('definition');
                            setTimeout(() => setHighlightedInput(null), 1000);
                            handleDismissSuggestions();
                        }}
                        onDismiss={handleDismissSuggestions}
                        targetLabel={definition}
                    />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectInput
                  label="Clue Type"
                  id="clueType"
                  value={clueType}
                  onChange={(e) => setClueType(e.target.value as ClueType)}
                  options={clueTypeOptions}
                  infoText={getClueTypeExplanation(clueType)}
                  getOptionTitle={(val) => getClueTypeExplanation(val as ClueType)}
                  disabled={isLoading}
                />
                <SelectInput
                  label="Setter Style"
                  id="setter"
                  value={setter}
                  onChange={(e) => setSetter(e.target.value)}
                  options={setterOptions}
                  infoText={getSetterExplanation(setter)}
                  getOptionTitle={getSetterExplanation}
                  disabled={isLoading}
                />
              </div>

              <div>
                <SelectInput
                    label="Theme (Optional)"
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    options={themeOptions}
                    disabled={isLoading}
                    infoText="Optionally, guide the clue's surface reading with a theme."
                />
                {theme === 'Custom' && (
                    <div className="mt-4">
                        <TextInput
                            label="Custom Theme"
                            id="customTheme"
                            value={customTheme}
                            onChange={(e) => setCustomTheme(e.target.value)}
                            maxLength={MAX_THEME_LENGTH}
                            placeholder="Enter your custom theme"
                            disabled={isLoading}
                        />
                    </div>
                )}
              </div>
              
              <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                <label htmlFor="toughie" className="flex items-center cursor-pointer">
                  <span className="text-sm font-medium text-gray-300 mr-3">Make it a 'Toughie'</span>
                  <div className="relative group" title="Increase clue difficulty significantly. Uses more obscure vocabulary, subtler indicators, and more complex wordplay.">
                    <InfoIcon />
                  </div>
                </label>
                <div className="relative">
                    <input
                        type="checkbox"
                        id="toughie"
                        checked={isToughie}
                        onChange={(e) => setIsToughie(e.target.checked)}
                        disabled={isLoading}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isLoading || isCoolingDown || !answer.trim() || !definition.trim()}>
                  {isLoading ? <Spinner /> : isCoolingDown ? 'Cooling down...' : 'Generate Clue'}
                </Button>
              </div>
            </form>

            {error && (
              <ErrorDisplay errorMessage={error} onDismiss={() => setError(null)} />
            )}

            {isLoading && (
              <div className="mt-6 text-center">
                <p className="text-indigo-300 animate-pulse">Crafting your clue...</p>
              </div>
            )}
            
            {generatedClue && !isLoading && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-indigo-300 mb-4 text-center">Your Generated Clue</h2>
                <ClueDisplay clue={generatedClue.clue} setter={generatedClue.setter} answerLength={answer.replace(/\s/g, '').length} />
              </div>
            )}
          </main>
        )}

        <footer className="text-center mt-8 text-xs text-gray-500">
            <p>Powered by Google's Gemini API. <a href="/about.html" className="text-indigo-400 hover:underline">About this tool</a>.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
