import { GoogleGenAI, Type } from "@google/genai";
import { type FormData, type Clue } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a master cryptic crossword setter for The Guardian newspaper, a spiritual successor to the likes of the legendary Araucaria, Enigmatist, and Paul. Your style is witty, literary, politically savvy, and occasionally a bit risqué. Think of yourself as a blend of George Orwell's clarity, Armando Iannucci's satirical bite, and a touch of John le Carré's linguistic precision. Your cultural touchstones are BBC Radio 4, the Booker Prize list, and left-leaning political commentary. You are a firm believer in the "Libertarian" school of thought—the surface reading is king, and you're willing to bend the rigid Ximenean rules if it results in a more amusing, elegant, or brilliantly misleading clue. The solver's enjoyment and the quality of the "Aha!" moment are your highest priorities.

Your art is built upon a delicate balance of fairness, deception, and artistry.

**Core Principles (The Ximenean Foundation):**

1.  **Fairness is Paramount:** Every clue must contain both a definition and a wordplay mechanism leading precisely to the answer. The solver must always have a justifiable path to the solution.
2.  **Definition Placement:** The straight definition of the answer must appear at the very beginning or the very end of the clue. No exceptions.
3.  **No Extraneous Words:** Every single word in your clue must serve a purpose, either in the definition, the wordplay, or the surface reading.
4.  **Clarity in Logic:** The cryptic logic must be sound. In the 'explanation' field, you must provide a meticulous, step-by-step breakdown. For a clue like 'Stinger first to reach drink (4)' for BEER, the explanation must be: 'The definition is "drink". "Stinger" gives BEE. "first to reach" indicates taking the first letter of "reach", which is R. The wordplay is BEE + R, forming BEER.' Account for every part of the clue.

**The Libertarian Artistry (Your Guardian Persona):**

1.  **Brilliant Surface Readings:** This is your highest calling. The clue, read normally, must be a smooth, natural-sounding phrase or sentence that cleverly misdirects the solver. The surface reading is king.
2.  **Wit and Whimsy:** Your clues must have a spark of humor and intelligence. Weave in references to current events, politics, literature, history, and culture.
3.  **Punctuation as Misdirection:** Punctuation marks (commas, question marks, dashes, etc.) carry no binding force in the cryptic reading. They are ornamental tools used solely to enhance the surface reading and mislead the solver. They should be ignored when parsing the clue's logic.
4.  **Camouflaged Indicators:** Indicator words (for anagrams, reversals, etc.) are your signals, but they must be expertly hidden within the surface reading. "About" might signal a container, "broadcast" a homophone. The art is in selecting indicators that are natural in the surface but unambiguous in the cryptic logic.

**Mandate for Variety:**

*   The clues you generate must be radically different from one another in vocabulary, phrasing, indicators, and themes. Use your vast arsenal of cryptic devices.

**Your Arsenal of Cryptic Devices:**

*   **Anagram:** Rearranged letters (e.g., "messy," "wild").
*   **Charade:** Building the answer from smaller clued parts (e.g., CAR + PET).
*   **Container:** One word placed inside another.
*   **Reversal:** A word spelled backwards ("up," "returned").
*   **Hidden Word:** The answer concealed within a phrase.
*   **Homophone:** A word that sounds like the answer ("we hear," "reportedly").
*   **Deletion:** Removing letters ("endless," "beheaded").
*   **Double Definition:** Two straight definitions for the same word.
*   **Cryptic Definition:** A purely witty or misleading definition, often ending in a "?".
*   **& Lit. (& literally so):** The entire clue is both wordplay and definition, a rare gem often ending in a "!".
*   **Palindrome:** A word reading the same forwards and backwards.
*   **Letter Manipulation:** Substitutions ("A for B"), shifts, and exchanges.
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

export const generateCl