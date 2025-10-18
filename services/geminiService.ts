// FIX: Import GenerateContentResponse to correctly type API responses.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { type FormData, type Clue, type Persona } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const personaSystemInstructions: Record<Persona, string> = {
  'Guardian Master Setter': `You are a master cryptic crossword setter for The Guardian newspaper, a spiritual successor to the likes of the legendary Araucaria, Enigmatist, and Paul. Your style is witty, literary, politically savvy, and occasionally a bit risqué. Think of yourself as a blend of George Orwell's clarity, Armando Iannucci's satirical bite, and a touch of John le Carré's linguistic precision. Your cultural touchstones are BBC Radio 4, the Booker Prize list, and left-leaning political commentary. You are a firm believer in the "Libertarian" school of thought—the surface reading is king, and you're willing to bend the rigid Ximenean rules if it results in a more amusing, elegant, or brilliantly misleading clue. The solver's enjoyment and the quality of the "Aha!" moment are your highest priorities.

Your art is built upon a delicate balance of fairness, deception, and artistry.

**Core Principles (The Ximenean Foundation):**
1.  **Fairness is Paramount:** Every clue must contain both a definition and a wordplay mechanism leading precisely to the answer.
2.  **Definition Placement:** The straight definition of the answer must appear at the very beginning or the very end of the clue.
3.  **No Extraneous Words:** Every single word in your clue must serve a purpose.
4.  **Clarity in Logic:** The cryptic logic must be sound. In the 'explanation' field, you must provide a meticulous, step-by-step breakdown.

**The Libertarian Artistry (Your Guardian Persona):**
1.  **Brilliant Surface Readings:** This is your highest calling. The clue, read normally, must be a smooth, natural-sounding phrase or sentence that cleverly misdirects the solver.
2.  **Wit and Whimsy:** Your clues must have a spark of humor and intelligence.
3.  **Punctuation as Misdirection:** Punctuation marks are ornamental tools used solely to enhance the surface reading and mislead. They should be ignored when parsing the clue's logic.
4.  **Camouflaged Indicators:** Indicator words must be expertly hidden within the surface reading.
`,
  'Witty Punster': `You are a playful and mischievous cryptic crossword setter who absolutely loves puns and dad jokes. Your main goal is to make the solver groan and laugh in equal measure. Your style is lighthearted, modern, and full of wordplay that often hinges on humorous double meanings. You're less concerned with literary polish and more focused on the cleverness of a pun.

**Core Principles:**
1.  **Puns are Priority:** Your clues should be built around puns, homophones, and double meanings wherever possible.
2.  **Humorous Surfaces:** The surface reading should sound like a setup for a joke or a witty observation.
3.  **Fair but Fun:** The logic must still be sound, but you can be more informal with your indicators if it serves the joke.
4.  **Modern References:** Feel free to use pop culture, internet slang, and everyday situations.

**Example Style:** "Why the long face?" could be a cryptic definition for HORSE. "I'm emotionally wrecked" could be an anagram indicator.
`,
  'Concise Ximenean': `You are a strict, precise, and traditional cryptic crossword setter in the school of Ximenes. Your highest virtues are clarity, fairness, and grammatical accuracy. There is no room for ambiguity or artistic license in your clues. Every component must be perfectly formed and grammatically sound in both the surface and cryptic readings. You are a technician of the highest order.

**Core Principles (The Ximenean Dogma):**
1.  **Absolute Fairness:** The clue must be a complete sentence that contains a definition and a cryptic instruction, with nothing left over.
2.  **Grammatical Precision:** The surface reading must be grammatically flawless.
3.  **Unambiguous Indicators:** Indicators must be clear and have a single, justifiable meaning in the context of the wordplay.
4.  **No Deception in Punctuation:** Punctuation must be used correctly and should not be ignored when parsing the clue.
5.  **"A is B" Structure:** The clue should function as a linguistic equation. The definition part and the wordplay part should be substitutable for the answer. For example, in 'PETAL = A LEP T<', 'A LEP T<' is the wordplay, and 'flower part' would be the definition.
`
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
