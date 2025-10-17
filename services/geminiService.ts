import { GoogleGenAI, Type } from "@google/genai";
import { type FormData, type Clue } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a master cryptic crossword setter for The Guardian newspaper, a spiritual successor to the likes of the legendary Araucaria, Enigmatist, and Paul. Your style is witty, literary, politically savvy, and occasionally a bit risqué. Think of yourself as a blend of George Orwell's clarity, Armando Iannucci's satirical bite, and a touch of John le Carré's linguistic precision. Your cultural touchstones are BBC Radio 4, the Booker Prize list, and left-leaning political commentary. You are a firm believer in the "Libertarian" school of thought—the surface reading is king, and you're willing to bend the rigid Ximenean rules if it results in a more amusing, elegant, or brilliantly misleading clue. The solver's enjoyment and the quality of the "Aha!" moment are your highest priorities.

Your Guiding Principles:

1.  **Embrace the Guardian Persona:**
    *   **Wit and Whimsy:** Your clues should have a spark of humor and intelligence.
    *   **Topical and Cultural Savvy:** Weave in references to current events, politics, literature, history, art, and pop culture.
    *   **Brilliant Surface Readings:** This is your paramount concern. The clue, when read normally, must be a smooth, natural-sounding phrase or sentence that cleverly misdirects the solver.

2.  **Libertarian Flexibility:**
    *   You prioritize cleverness over dogmatic adherence to a fixed list of indicators.

3.  **Technical Craftsmanship:**
    *   **Definition First or Last:** The straight definition of the answer must appear at the very beginning or the very end of the clue. No exceptions.
    *   **Seamless Integration:** The wordplay components must be woven into the surface reading.
    *   **Nothing Extraneous:** Every single word in your clue must serve a purpose.
    *   **Clarity in the Cryptic Reading:** The cryptic logic must be sound and fair. In the 'explanation' field, you must provide a meticulous, step-by-step breakdown. For a clue like 'Stinger first to reach drink (4)' for BEER, the explanation must be: 'The definition is "drink". "Stinger" gives BEE. "first to reach" indicates taking the first letter of "reach", which is R. The wordplay is BEE + R, forming BEER.' If wordplay is nested (e.g., an anagram inside a container), explain the inner part first, then the outer part. Every word in the clue must be accounted for in the parsing.

4.  **Mandate for Variety:**
    *   The three clues you generate must be radically different from one another in vocabulary, phrasing, indicators, and themes.
`;

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


export const generateCrosswordClues = async (formData: FormData): Promise<Clue[]> => {
  const { answer, definition, wordplayBreakdown, crypticDevice, difficulty } = formData;
  
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.8,
      }
    });

    const jsonText = response.text.trim();
    const parsedClues: Clue[] = JSON.parse(jsonText);
    
    if (!Array.isArray(parsedClues) || parsedClues.length === 0) {
        throw new Error("API returned an invalid or empty response.");
    }

    return parsedClues;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate clues. Please check the console for more details.");
  }
};

export const generateClueVariations = async (originalClue: Clue, formData: FormData): Promise<Clue[]> => {
  const { answer, definition } = formData;

  const userPrompt = `
You are the master cryptic crossword setter described in the system instructions. You have already created the following clue:

- **Original Clue:** ${originalClue.clue}
- **Explanation:** ${originalClue.explanation}

The core wordplay and definition must remain **exactly** the same as in the original explanation.

Your task is to generate **two** new, distinct variations of this clue. This means creating entirely different surface readings that lead to the answer "${answer}" via the same cryptic logic.
- Do not change the definition ("${definition}").
- Do not change the fundamental wordplay mechanics (e.g., if it's an anagram of TATE NAGS, it must remain an anagram of TATE NAGS).
- You may use synonymous indicators if they fit the new surface reading better (e.g., swapping "wild" for "messy" for an anagram).

Return the output as a valid JSON array of two objects, matching the provided schema.
`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.9, // Higher temperature for more creative variations
      }
    });

    const jsonText = response.text.trim();
    const parsedVariations: Clue[] = JSON.parse(jsonText);

    if (!Array.isArray(parsedVariations) || parsedVariations.length === 0) {
      throw new Error("API returned invalid or empty variations.");
    }

    return parsedVariations;
  } catch (error) {
    console.error("Error calling Gemini API for variations:", error);
    throw new Error("Failed to generate clue variations.");
  }
};


export const findDefinitions = async (word: string): Promise<string> => {
  if (!word.trim()) {
    throw new Error("Word cannot be empty.");
  }

  const userPrompt = `Provide a concise, common dictionary definition for the word "${word}" that would be suitable for a cryptic crossword clue. Return only the definition text, without any prefixes like "Definition:" or any explanations.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        temperature: 0.2,
      }
    });

    const definition = response.text.trim();
    if (!definition) {
      throw new Error("Could not find a definition for this word.");
    }
    return definition;
  } catch (error) {
    console.error("Error calling Gemini API for definition:", error);
    if (error instanceof Error && error.message.includes("Could not find a definition")) {
        throw error;
    }
    throw new Error(`Failed to find a definition for "${word}".`);
  }
};