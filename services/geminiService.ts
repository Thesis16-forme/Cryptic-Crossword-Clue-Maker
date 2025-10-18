import { GoogleGenAI } from "@google/genai";
import { ClueType, GeneratedClue } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AppMetadata {
  setters: string[];
}

// Use a promise to load metadata once and cache it.
let metadataPromise: Promise<AppMetadata> | null = null;

const loadMetadata = async (): Promise<AppMetadata> => {
  try {
    const response = await fetch('/metadata.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.setters || !Array.isArray(data.setters)) {
        throw new Error("Metadata is missing 'setters' array.");
    }
    return data;
  } catch (error) {
    console.error("Could not load or parse metadata.json, using fallback setters.", error);
    // Fallback data in case of error
    return {
      setters: [
        "Araucaria", "Azed", "Boatman", "Bunthorne", "Cinephile",
        "Enigmatist", "Everyman", "Gordius", "Pasquale", "Paul",
        "Rufus", "Shed", "Torquemada", "Ximenes"
      ]
    };
  }
};

export const getMetadata = (): Promise<AppMetadata> => {
    if (!metadataPromise) {
        metadataPromise = loadMetadata();
    }
    return metadataPromise;
}

const handleApiError = (error: unknown): Error => {
  console.error("Gemini API Error:", error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes("api key not valid") || message.includes("not found")) {
      return new Error("Invalid API Key. Please check your configuration.");
    }
    if (message.includes("rate limit") || message.includes("quota")) {
      return new Error("You've made too many requests. Please wait a moment and try again.");
    }
    if (message.includes("candidate was blocked")) {
      return new Error("The request was blocked for safety reasons. Please modify your input and try again.");
    }
    if (message.includes("failed to fetch")) {
        return new Error("Network error. Please check your internet connection and try again.");
    }
  }
  
  // Default fallback error for other unhandled cases
  return new Error("An unexpected error occurred with the AI service. Please try again later.");
};

export const getSetterExplanation = (setter: string): string => {
  switch (setter) {
    case "Araucaria":
      return "Playful, witty, often with clever, highly misleading surface readings and elaborate themes.";
    case "Ximenes":
      return "The epitome of precision. Strictly fair, grammatically perfect wordplay with no ambiguity.";
    case "Azed":
      return "A follower of the Ximenean tradition, but known for using obscure words and being very challenging.";
    case "Bunthorne":
      return "A classic setter, often witty and elegant in clue construction.";
    case "Pasquale":
      return "A linguist, his clues are precise and often feature clever wordplay, with a slightly academic feel.";
    case "Rufus":
      return "Known for a light touch, heavy use of cryptic definitions and double definitions, making his puzzles accessible.";
    case "Enigmatist":
      return "As the name suggests, highly complex, multi-layered wordplay that is very challenging and intricate.";
    case "Torquemada":
      return "Historically notorious for being exceptionally obscure and difficult.";
    case "Everyman":
      return "Beginner-friendly. Clues are clear, fair, and an excellent introduction to cryptics.";
    case "Cinephile":
      return "Often includes themes related to film and cinema. Playful and entertaining.";
    case "Gordius":
      return "Frequently incorporates political or satirical commentary into his clues.";
    case "Paul":
      return "Famous for witty, humorous, and often cheeky or risqué clues.";
    case "Shed":
      return "Witty, playful, and inventive, in a similar vein to Paul.";
    case "Boatman":
      return "Often builds puzzles around a central theme (e.g., sailing), where surface readings cleverly relate to it.";
    default:
      return "Select a setter to see their stylistic description.";
  }
};

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
    case ClueType.SPOONERISM:
        return "A spoonerism. The initial sounds of two or more words are swapped. The clue defines both the resulting phrase (the answer) and the original words. It often includes an indicator like 'the Reverend says' (after Rev. William Spooner) or similar phrases suggesting a verbal mix-up. For example, for the answer BELTED MUTTER, the clue might point towards the phrase 'melted butter'.";
    case ClueType.CRYPTIC_DEFINITION:
        return "A cryptic definition. The entire clue is a witty, misleading, or punning definition of the answer. There is no separate wordplay part; the definition itself is the cryptic puzzle. Often ends with a question mark. For example, for the answer ROW: 'A telling-off on the water?'";
    case ClueType.INITIALISM:
        return "An initialism (or acrostic). The answer is formed by taking the first letters of words in the clue. It requires an indicator such as 'at first', 'initially', 'starts to', or 'in the beginning'. For example, for the answer GEAR: 'Starts to get every answer right'.";
    default:
      return "A standard cryptic clue.";
  }
};

export const getSynonyms = async (text: string): Promise<string[]> => {
    if (!text || text.trim().length === 0) {
        return [];
    }
    
    const prompt = `
        You are a thesaurus expert. Your task is to provide a list of synonyms for a given word or phrase.
        
        **Instructions:**
        1. Analyze the following text: "${text}"
        2. Generate a list of up to 10 relevant synonyms.
        3. The synonyms should be single words or short phrases.
        4. Your response MUST be ONLY a valid JSON array of strings. For example: ["synonym1", "synonym2", "synonym3"].
        5. If you cannot find any synonyms, return an empty JSON array: [].
        6. Do not include the original word in the list.
        7. Do not add any preamble, explanation, or markdown backticks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let responseText = response.text.trim();
        const jsonRegex = /```(json)?\s*([\s\S]*?)\s*```/;
        const match = responseText.match(jsonRegex);
        if (match && match[2]) {
            responseText = match[2].trim();
        }

        try {
            const parsedResponse: string[] = JSON.parse(responseText);
            if (!Array.isArray(parsedResponse)) {
                console.error("AI response for synonyms was not an array:", parsedResponse);
                return [];
            }
            return parsedResponse;
        } catch (e) {
            console.error("Failed to parse synonyms response as JSON:", responseText);
            return [];
        }
    } catch (error) {
        throw handleApiError(error);
    }
};


export const generateClue = async (
    answer: string,
    definition: string,
    clueType: ClueType,
    isToughie: boolean,
    setter: string
): Promise<GeneratedClue> => {
  const toughieInstruction = isToughie 
    ? `
**Difficulty:** This is a 'Toughie' clue. Increase the difficulty significantly. Use more obscure vocabulary, subtler indicators, and more complex or layered wordplay. The surface reading should be exceptionally misleading.`
    : `
**Difficulty:** Standard difficulty. The clue should be challenging but fair for an average solver.`;

  const prompt = `
    You are an expert cryptic crossword setter. Your task is to generate one concise, elegant, and witty cryptic crossword clue.

    **Style and Persona:**
    Adopt the persona of the famous cryptic crossword setter: **${setter}**. Emulate this setter's specific style by following these guidelines:
    - **Araucaria:** Playful, witty, often with clever, highly misleading surface readings and elaborate themes. **Avoid:** Making clues unsolvable without guessing the theme; individual clues must be fair on their own.
    - **Ximenes:** The epitome of precision. Strictly fair, grammatically perfect wordplay with no ambiguity. **Avoid:** Any indirect wordplay, definitions that are merely associative, or ambiguity. Every part of the clue must be precise.
    - **Azed:** A follower of the Ximenean tradition, but known for using obscure words and being very challenging. **Avoid:** Using words that are not in a comprehensive dictionary (like Chambers). The wordplay must remain strictly fair despite the difficult vocabulary.
    - **Bunthorne:** A classic setter, often witty and elegant in clue construction. **Avoid:** Clumsy or convoluted surface readings; the wit should feel natural, not forced.
    - **Pasquale:** A linguist, his clues are precise and often feature clever wordplay, sometimes with a slightly academic feel. **Avoid:** Overly dry clues; precision should not sacrifice the 'aha!' moment.
    - **Rufus:** Known for a light touch, heavy use of cryptic definitions and double definitions, making his puzzles accessible. **Avoid:** Cryptic definitions that are too straightforward. There must still be a misleading element.
    - **Enigmatist:** As the name suggests, highly complex, multi-layered wordplay that is very challenging and intricate. **Avoid:** Making clues so complex they become an unfair chore to solve. Each layer of wordplay must be logically sound.
    - **Torquemada:** Historically notorious for being exceptionally obscure and difficult. **Avoid:** Being completely unparsable by modern standards. Clues should not require impossible-to-find external knowledge.
    - **Everyman:** Beginner-friendly. Clues are clear, fair, and an excellent introduction to cryptics. **Avoid:** Overly simplistic or non-cryptic clues. Wordplay indicators should be clear but still present a challenge.
    - **Cinephile:** Often includes themes related to film and cinema. Playful and entertaining. **Avoid:** Using references to very obscure films or major spoilers. The clue must be solvable even if the solver doesn't know the specific film.
    - **Gordius:** Frequently incorporates political or satirical commentary into his clues. **Avoid:** Letting commentary overshadow the wordplay or using references that will date too quickly. The clue must be solvable regardless of political views.
    - **Paul:** Famous for witty, humorous, and often cheeky or risqué clues. **Avoid:** Being crude rather than witty. Avoid obscure slang. The humour should come from clever misdirection.
    - **Shed:** Witty, playful, and inventive, in a similar vein to Paul. **Avoid:** Breaking fundamental cryptic rules for the sake of an inventive idea. Ensure the surface reading is coherent.
    - **Boatman:** Often builds puzzles around a central theme (e.g., sailing), where surface readings cleverly relate to it. **Avoid:** Using jargon so specific that only a subject expert could solve it. Clues must be solvable independently of the theme.
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
      "setter": "${setter}"
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let text = response.text.trim();
    if (!text) {
        throw new Error("The AI returned an empty response. Please try a different input.");
    }

    // The model sometimes wraps the JSON in markdown backticks. Let's remove them.
    const jsonRegex = /```(json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match && match[2]) {
        text = match[2].trim();
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
            setter: setter,
        };
    }

  } catch (error) {
    throw handleApiError(error);
  }
};