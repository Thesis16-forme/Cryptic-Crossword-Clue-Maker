// FIX: Import GenerateContentResponse to correctly type API responses.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { type FormData, type Clue, type Persona } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const personaSystemInstructions: Record<Persona, string> = {
  'Guardian Master Setter': `You are a master cryptic crossword setter for The Guardian newspaper.
- **Style:** Witty, literary, politically savvy, and occasionally risqué, in the vein of setters like Araucaria and Paul.
- **Philosophy:** Prioritize brilliant, misleading surface readings over rigid Ximenean rules (a "Libertarian" approach). The solver's "Aha!" moment is paramount.
- **Rules:**
  1. Every clue must have a fair definition (at the start or end) and a clear wordplay mechanism.
  2. The surface reading must be a smooth, natural-sounding phrase that cleverly misdirects the solver.
  3. Punctuation is a tool for misdirection and should be ignored for the cryptic logic.
  4. Indicators must be skillfully hidden within the surface reading.`,
  'Witty Punster': `You are a playful and mischievous cryptic crossword setter who loves puns and dad jokes.
- **Style:** Lighthearted, modern, informal, and humorous.
- **Philosophy:** The primary goal is to make the solver groan and laugh. Cleverness and fun trump literary polish.
- **Rules:**
  1. Build clues around puns, homophones, and humorous double meanings wherever possible.
  2. The surface reading should sound like a setup for a joke or a witty observation.
  3. The cryptic logic must be sound, but indicators can be more informal if it serves the joke.
  4. Feel free to use modern pop culture references.`,
  'Concise Ximenean': `You are a strict, precise, and traditional cryptic crossword setter following the school of Ximenes.
- **Style:** Technically perfect, clear, fair, and grammatically flawless. No ambiguity is tolerated.
- **Philosophy:** A clue is a perfect linguistic equation where the definition and wordplay are interchangeable with the answer.
- **Rules:**
  1. The clue must be a complete, grammatically sound sentence with no extraneous words.
  2. Indicators must be unambiguous and standard.
  3. Punctuation must be used correctly and is integral to the grammar, not a tool for misdirection.
  4. The clue must contain a precise definition and a fair wordplay component.`,
};

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      clue: {
        type: Type.STRING,
        description: "The full cryptic crossword clue, including the word count in parentheses, e.g., (8).",
      },
      explanation: {
        type: Type.STRING,
        description: "A clear, concise, and meticulous step-by-step breakdown of how the clue is parsed, explaining the definition, wordplay, and all indicators.",
      },
    },
    required: ["clue", "explanation"],
  },
};

const callGeminiWithRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let attempt = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if ((errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
        console.warn(`API request failed (likely rate limit). Retrying in ${delay.toFixed(0)}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("Error calling Gemini API:", error);
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("The AI service is currently busy due to high demand. Please try again in a few moments. If the problem persists, check your API plan and billing details.");
        }
        throw new Error("An unexpected error occurred while communicating with the AI service. Please check the console for more details.");
      }
    }
  }
};

export const generateCrosswordClues = async (formData: FormData): Promise<Clue[]> => {
  const { answer, definition, wordplayBreakdown, crypticDevice, difficulty, persona } = formData;
  
  const difficultyInstruction = {
    Easy: 'Aim for straightforward indicators, common vocabulary, and clear surface readings. Avoid overly complex or multi-layered wordplay.',
    Medium: 'A standard Guardian-level clue. Expect clever misdirection, witty surfaces, and some cultural references. The wordplay can have a couple of steps.',
    Hard: 'Challenge the solver with advanced vocabulary, subtle or disguised indicators, deeply misleading surface readings, and potentially multi-layered or complex wordplay (e.g., an anagram within a container). Think Azed or Enigmatist on a tough day.',
  }[difficulty];

  let wordplayInstruction: string;
  let deviceInstruction: string;

  if (wordplayBreakdown && wordplayBreakdown.trim()) {
    wordplayInstruction = `- **WORDPLAY BREAKDOWN:** ${wordplayBreakdown}`;
    deviceInstruction = crypticDevice === 'Any'
      ? 'Choose the most suitable cryptic device for the given wordplay.'
      : `Strictly use the following CRYPTIC DEVICE: ${crypticDevice}`;
  } else {
    wordplayInstruction = `- **WORDPLAY BREAKDOWN:** Not provided. You must invent the wordplay.`;
    deviceInstruction = crypticDevice === 'Any'
      ? 'Invent your own wordplay, using any cryptic device you see fit.'
      : `Invent your own wordplay, strictly using the following CRYPTIC DEVICE: ${crypticDevice}.`;
  }

  const userPrompt = `
Generate three completely distinct and high-quality cryptic crossword clues for the provided data. Adhere strictly to the persona and guiding principles.

**Clue Information:**
- **ANSWER:** ${answer}
- **DEFINITION:** "${definition}"
${wordplayInstruction}
- **DIFFICULTY:** ${difficulty}. ${difficultyInstruction}
- ${deviceInstruction}

Return the output as a valid JSON array of three objects, matching the provided schema. Ensure each clue is unique in its theme, vocabulary, and approach.
`;

  const systemInstruction = personaSystemInstructions[persona] || personaSystemInstructions['Guardian Master Setter'];

  // FIX: Explicitly provide the generic type to callGeminiWithRetry to ensure 'response' is correctly typed.
  const response = await callGeminiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.8,
    }
  }));

  const jsonText = response.text.trim();
  let parsedClues: Clue[];
  try {
      parsedClues = JSON.parse(jsonText);
  } catch (e) {
      console.error("Failed to parse JSON response:", jsonText);
      throw new Error("The AI service returned an unexpected response format.");
  }
  
  if (!Array.isArray(parsedClues) || parsedClues.length === 0) {
      throw new Error("API returned an invalid or empty response.");
  }

  return parsedClues;
};

export const findDefinitions = async (word: string): Promise<string> => {
  const userPrompt = `Provide a concise, dictionary-style definition for the word "${word}". The definition should be suitable for a cryptic crossword. Focus on the most common and direct meaning. Return only the definition as a single string, without any introductory phrases like "The definition of... is".`;

  // FIX: Explicitly provide the generic type to callGeminiWithRetry to ensure 'response' is correctly typed.
  const response = await callGeminiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: "You are a concise lexicographer.",
      temperature: 0.2,
    }
  }));
  
  const definition = response.text.trim();
  if (!definition) {
      throw new Error("Could not find a definition for the word.");
  }

  // Capitalize the first letter
  return definition.charAt(0).toUpperCase() + definition.slice(1);
};

export const generateClueVariations = async (originalClue: Clue, formData: FormData): Promise<Clue[]> => {
  const { answer, definition, difficulty, persona } = formData;

  const difficultyInstruction = {
    Easy: 'Aim for straightforward indicators, common vocabulary, and clear surface readings.',
    Medium: 'A standard Guardian-level clue. Expect clever misdirection and witty surfaces.',
    Hard: 'Challenge the solver with advanced vocabulary, subtle indicators, and deeply misleading surface readings.',
  }[difficulty];

  const userPrompt = `
Generate two distinct variations of the following cryptic crossword clue. Maintain the same answer, definition, and core wordplay logic, but alter the surface reading, vocabulary, and indicators. Adhere strictly to the persona and guiding principles.

**Original Clue Information:**
- **ANSWER:** ${answer}
- **DEFINITION:** "${definition}"
- **DIFFICULTY:** ${difficulty}. ${difficultyInstruction}
- **ORIGINAL CLUE:** "${originalClue.clue}"
- **ORIGINAL PARSING:** "${originalClue.explanation}"

**Instructions:**
1.  Do not change the fundamental wordplay (e.g., if it's an anagram of specific letters, use the same letters).
2.  Create two new surface readings that are completely different from the original and from each other.
3.  Use different indicator words.
4.  Provide a new parsing explanation for each variation that matches the new clue's wording.

Return the output as a valid JSON array of two objects, matching the provided schema.
`;

  const systemInstruction = personaSystemInstructions[persona] || personaSystemInstructions['Guardian Master Setter'];

  // FIX: Explicitly provide the generic type to callGeminiWithRetry to ensure 'response' is correctly typed.
  const response = await callGeminiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.9,
    }
  }));

  const jsonText = response.text.trim();
  let parsedVariations: Clue[];
  try {
      parsedVariations = JSON.parse(jsonText);
  } catch (e) {
      console.error("Failed to parse JSON response for variations:", jsonText);
      throw new Error("The AI service returned an unexpected response format for variations.");
  }
  
  if (!Array.isArray(parsedVariations) || parsedVariations.length === 0) {
      throw new Error("API returned invalid or empty variations.");
  }

  return parsedVariations;
};