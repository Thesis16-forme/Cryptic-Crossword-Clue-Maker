import { GoogleGenAI } from "@google/genai";
import { ClueType, GeneratedClue } from '../types';
import metadata from '../metadata.json';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Export the function to make it available for import in other files.
export const getClueTypeExplanation = (clueType: ClueType): string => {
  switch (clueType) {
    case ClueType.ANAGRAM:
      return "An anagram. The clue must contain a jumbled version of the answer letters (fodder) and an anagram indicator. Common indicators are words suggesting change or chaos: 'jumbled', 'confused', 'damaged', 'novel', 'wild', 'shredded', 'mixed-up', 'out', 'off', 'crazy'.";
    case ClueType.CHARADE:
      return "A charade (word sum). The answer is formed by combining shorter words in sequence. The clue must define each part separately. For example, to get CARPET (a floor covering), the clue would combine a definition for 'CAR' (vehicle) and 'PET' (animal).";
    case ClueType.CONTAINER:
      return "A container. One word is placed inside another to form the answer. It needs an indicator for containment (e.g., 'swallows', 'in', 'around', 'clutching') and definitions for both words. For example, to form HEAT, a clue may put 'E' (drugs) inside 'HAT' (a head covering), using an indicator like 'found in'.";
    case ClueType.REVERSAL:
      return "A reversal. The answer is another word spelled backward. It requires a reversal indicator (e.g., 'sent back', 'reflects', 'going west', 'returns', 'receding', 'turning up' for down clues) and a definition of the reversed word. For example, POOL reversed becomes LOOP.";
    case ClueType.HOMOPHONE:
      return "A homophone. The answer sounds like another word or phrase. It needs a sound indicator (e.g., 'spoken', 'on the radio', 'we hear', 'reportedly', 'to the audience') and definitions for both the answer and the word it sounds like. For example, KNIGHT sounds like NIGHT.";
    case ClueType.DOUBLE_DEFINITION:
      return "A double definition. The clue consists of two different, distinct dictionary definitions for the same answer word, with no extra wordplay. For example, for MATCH: 'A competitive game' and 'A small stick for starting a fire'.";
    case ClueType.DELETION:
        return "A deletion. A letter or letters are removed from a word to form the answer. Indicators specify the removal: 'headless' (first letter removed, e.g., START -> TART), 'endless' or 'unfinished' (last letter removed), or 'heartless' (middle letter/s removed).";
    case ClueType.PALINDROME:
        return "A palindrome. The answer reads the same forwards and backwards. The clue often includes an indicator suggesting symmetry like 'symmetrical', 'going both ways', or 'reflecting'. Examples include LEVEL and RACECAR.";
    case ClueType.HIDDEN_WORD:
        return "A hidden word (or 'hiddens'). The answer is concealed directly within a phrase in the clue. An indicator like 'part of', 'some', 'concealed by', or 'within' points it out. For example, the answer TEN is hidden in 'paTENts'.";
    case ClueType.LITERAL:
        return "A literal or '&lit.' clue. The entire clue is a single entity that works as both a definition for the answer and the wordplay to construct it. The whole clue must literally describe the answer. Example for EGG: 'E.g., origin of goose!' where 'e.g.' gives EG and 'origin of goose' gives G, and the whole clue defines an egg.";
    case ClueType.COMPOSITE:
        return "A composite clue. This clue combines two or more different wordplay types (like an anagram and a container) to arrive at the answer. This is often used for longer answers. The clue must clearly delineate the different wordplay steps. Example for HONORABLE: 'Illustrious baron returns in pit' -> NORAB (baron reversed) inside HOLE (pit).";
    default:
      return "A standard cryptic clue.";
  }
};

export const generateClue = async (
    answer: string,
    definition: string,
    clueType: ClueType,
    isToughie: boolean
): Promise<GeneratedClue> => {
  const setters = metadata.setters;
  const randomSetter = setters[Math.floor(Math.random() * setters.length)];

  const toughieInstruction = isToughie 
    ? `
**Difficulty:** This is a 'Toughie' clue. Increase the difficulty significantly. Use more obscure vocabulary, subtler indicators, and more complex or layered wordplay. The surface reading should be exceptionally misleading.`
    : `
**Difficulty:** Standard difficulty. The clue should be challenging but fair for an average solver.`;

  const prompt = `
    You are an expert cryptic crossword setter. Your task is to generate one concise, elegant, and witty cryptic crossword clue.

    **Style and Persona:**
    Adopt the persona of the famous cryptic crossword setter: **${randomSetter}**. Emulate this setter's specific style.
    - **Araucaria Style:** Playful, witty, often with clever surface readings that are highly misleading.
    - **Ximenes Style:** Strictly precise, grammatically perfect, and scrupulously fair wordplay.
    - **Torquemada Style:** Notoriously obscure and difficult.
    - **Rufus Style:** Often uses cryptic definitions and double definitions, with a light touch.
    You MUST emulate the chosen setter's style in your response.

    **Clue Complexity:**
    Vary the complexity based on the chosen wordplay type. For instance, a DOUBLE_DEFINITION should be simple and elegant, while a COMPOSITE clue should naturally be more intricate and layered.
    ${toughieInstruction}

    **Rules for the Clue:**
    1.  The clue must have two parts: a precise, dictionary-style definition and a wordplay part.
    2.  The wordplay must fairly and logically lead to the answer.
    3.  The clue as a whole (the 'surface reading') must be a grammatically correct and natural-sounding phrase.
    4.  The final clue must NOT contain the answer word itself.
    5.  Do not add the answer's length in brackets at the end. I will do that.

    **Clue Details:**
    -   **Answer:** "${answer.toUpperCase()}"
    -   **Definition to use:** "${definition}"
    -   **Required Wordplay Type:** ${clueType}
    -   **Explanation of Wordplay:** ${getClueTypeExplanation(clueType)}
    
    **Your Response:**
    Provide ONLY a valid JSON object in the following format. Do not add any preamble, explanation, or markdown backticks.
    {
      "clue": "The final cryptic clue text.",
      "setter": "${randomSetter}"
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("The AI returned an empty response. Please try a different input.");
    }

    try {
        const parsedResponse: GeneratedClue = JSON.parse(text);
        if (!parsedResponse.clue || !parsedResponse.setter) {
            throw new Error("AI response is missing required fields.");
        }
        return parsedResponse;
    } catch (e) {
        console.error("Failed to parse AI response as JSON:", text);
        // Fallback in case of malformed JSON
        return {
            clue: text.replace(/\\"/g, '"'), // Basic un-escaping
            setter: randomSetter,
        };
    }

  } catch (error) {
    console.error("Error generating clue with Gemini API:", error);
    throw new Error("Failed to generate clue. The AI service may be unavailable or the request was blocked.");
  }
};