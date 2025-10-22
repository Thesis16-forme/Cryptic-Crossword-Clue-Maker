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
        "Anax", "Araucaria", "Azed", "Boatman", "Bunthorne", "Cinephile",
        "Dac", "Enigmatist", "Everyman", "Gordius", "Pasquale", "Paul",
        "Picaroon", "Rufus", "Shed", "Torquemada", "Vlad", "Ximenes"
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

// A map of error substrings to user-friendly messages for cleaner handling.
const ERROR_MAP: { [key: string]: string } = {
  // API Key issues
  'api key not valid': "It seems there's an issue with the API key. Please ensure it's configured correctly.",
  'api_key_not_valid': "It seems there's an issue with the API key. Please ensure it's configured correctly.",
  'not found': "It seems there's an issue with the API key. Please ensure it's configured correctly.",
  
  // Quota issues
  'quota': "You've reached your usage limit for the API. Please check your account details or try again later.",
  'resource_exhausted': "You've reached your usage limit for the API. Please check your account details or try again later.",
  
  // Rate limiting issues
  'rate limit': "You're generating clues very quickly! Please wait a moment before trying again.",
  
  // Content safety issues
  'candidate was blocked': "The generated clue was blocked due to safety filters. Please try adjusting your answer or definition.",
  
  // Network issues
  'failed to fetch': "Could not connect to the AI service. Please check your internet connection.",
  
  // Server-side issues
  'server error': "The AI service is experiencing some technical difficulties. Please try again in a few moments.",
  '500': "The AI service is experiencing some technical difficulties. Please try again in a few moments.",
  '503': "The AI service is experiencing some technical difficulties. Please try again in a few moments.",
  'service unavailable': "The AI service is experiencing some technical difficulties. Please try again in a few moments.",
  
  // Badly formatted response from AI
  'unexpected format': "The AI's response was not in the expected format. This might be a temporary issue; please try again.",
  'invalid response': "The AI's response was not in the expected format. This might be a temporary issue; please try again.",
  'invalid json': "The AI's response was not in the expected format. This might be a temporary issue; please try again.",
};

const handleApiError = (error: unknown): Error => {
  console.error("Gemini API Error:", error);

  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message.toLowerCase();
  } else {
    try {
      errorMessage = JSON.stringify(error).toLowerCase();
    } catch (e) {
      errorMessage = String(error).toLowerCase();
    }
  }

  for (const key in ERROR_MAP) {
    if (errorMessage.includes(key)) {
      return new Error(ERROR_MAP[key]);
    }
  }

  // Default fallback error for other unhandled cases
  return new Error("An unexpected error occurred with the AI service. Please try again later.");
};


/**
 * Extracts a JSON string from a potential Markdown code block and parses it.
 * @param text The raw text response from the API.
 * @returns The parsed JSON object.
 */
const extractAndParseJson = <T>(text: string): T => {
    let jsonString = text.trim();

    // Regex to find content inside a JSON markdown block (e.g., ```json ... ```)
    const markdownBlockRegex = /```(?:json\s*)?([\s\S]*?)```/;
    const match = jsonString.match(markdownBlockRegex);

    if (match && match[1]) {
        jsonString = match[1];
    }

    try {
        return JSON.parse(jsonString) as T;
    } catch (parseError) {
        console.error("Failed to parse JSON:", jsonString, parseError);
        // Throw a specific error to be caught and handled by handleApiError
        throw new Error("The AI returned a response in an unexpected format (invalid JSON).");
    }
};

export const getSetterExplanation = (setter: string): string => {
  switch (setter) {
    case "Anax":
      return "A modern master of the difficult puzzle. Anax is known for highly inventive, sometimes fiendishly complex clues with brilliant surface readings. His puzzles often push the boundaries of cluing conventions, featuring multi-layered wordplay and exceptionally clever definitions. A tough but rewarding challenge for experts.";
    case "Araucaria":
      return "The late, great Araucaria was known for his playful, liberal, and often humorous style. He was a master of the elaborate themed puzzle (often alphabetical jigsaws) and wasn't afraid to bend the 'rules' for the sake of a great clue, famously using split-letter answers. Expect wit, invention, and a delightful sense of fun.";
    case "Azed":
      return "A torchbearer of the strict Ximenean tradition, known for his advanced, highly challenging 'plain' puzzles. Azed clues are scrupulously fair but demand a vast vocabulary, as his signature device is the use of obscure, archaic, and dialect words (often indicated by an asterisk). Tough but rewarding for the connoisseur.";
    case "Boatman":
      return "A master of the themed puzzle. Boatman's signature is that nearly every clue's surface reading will cleverly relate to the puzzle's central theme, creating a wonderfully cohesive and immersive experience. He uses a wide variety of inventive clue types to serve the theme.";
    case "Bunthorne":
      return "A classic and respected setter for The Guardian. Bunthorne's style is characterized by its wit, elegance, and smooth surface readings. His clues are generally fair and Ximenean in spirit, providing a satisfying challenge without being overly obscure or wild. A reliable and high-quality traditionalist.";
    case "Cinephile":
      return "The pseudonym of the late, great Araucaria, primarily used for the Financial Times. As the name suggests, his puzzles were often infused with themes from the world of film. The style is playful, witty, and highly entertaining, carrying all the hallmarks of his main persona.";
    case "Dac":
       return "Widely regarded for his exceptionally smooth, natural surface readings and scrupulously fair clues. Dac's puzzles are a model of elegance and consistency, providing a satisfying and accessible challenge that is witty without being overly difficult. He is considered a master craftsman of the 'invisible' clue, where the wordplay is seamlessly hidden.";
    case "Enigmatist":
      return "One of the toughest setters out there (the pseudonym of John Henderson, who also sets as Nimrod). Enigmatist's clues are notoriously difficult, featuring intricate, multi-layered wordplay and fiendishly misleading definitions. He often plays with the structure of the clue itself. A serious undertaking reserved for expert solvers.";
    case "Everyman":
      return "The traditional name for The Observer's beginner-friendly puzzle. Everyman clues are a perfect starting point, designed to be straightforward and scrupulously fair, often featuring one or two longer anagrams to help solvers get a foothold. Ideal for learning the ropes of cryptic crosswords.";
    case "Gordius":
      return "Known for his sharp wit and a signature tendency to weave left-leaning political and social commentary into his puzzles. Gordius's clues often have a satirical edge, with surface readings that poke fun at current events, public figures, and institutions.";
    case "Pasquale":
      return "A highly prolific setter and linguist, also known as 'The Don'. Pasquale's clues are known for their Ximenean precision and economy of language. He often has a slightly academic or high-brow feel, using scientific or classical references, but the wordplay is always fair and logical.";
    case "Paul":
      return "One of the most popular modern setters, famous for his wit, humour, and a signature love of mischievous, schoolboyish vulgarity. His clues are often laugh-out-loud funny and known for clever use of innuendo, but the underlying wordplay is always brilliant and scrupulously fair.";
    case "Picaroon":
       return "A highly popular Guardian setter, known for his mischievous wit and superbly constructed clues. Picaroon (also known as Buccaneer) blends clever wordplay with entertaining surfaces, often with a modern and topical flavour. His puzzles are fun and challenging in equal measure, a perfect example of the modern Guardian style.";
    case "Rufus":
      return "A master of the gentle cryptic, perfect for beginners. His signature style was a heavy reliance on witty cryptic definitions and double definitions, with less emphasis on complex, multi-part wordplay. The goal is fun and a satisfying 'aha!' moment, making his puzzles an ideal entry point.";
    case "Shed":
      return "Shares a similar humorous and inventive style with Paul. His clues are known for their wit and clever misdirection, often with a slightly gentler touch than Paul's more outrageous offerings. A fun and rewarding solve.";
    case "Torquemada":
      return "The legendary and notoriously difficult setter for The Saturday Review. Torquemada is famous for inventing the modern cryptic crossword, featuring incredibly complex, literary, and often punning clues. His puzzles were exercises in lateral thinking and deep knowledge, setting the bar for difficulty.";
    case "Vlad":
      return "Also known as 'The Impaler', Vlad is known for his tough, spiky, and often politically charged puzzles. His clues can be mischievous and difficult, featuring complex wordplay and challenging vocabulary, often with a satirical bite. An expert-level challenge.";
    case "Ximenes":
      return "The influential successor to Torquemada, who set the modern standards for fair play in cryptic clues. Ximenes's style is the epitome of precision, logic, and fairness, where every part of the clue has a purpose. His puzzles are difficult but scrupulously constructed, forming the basis of the 'Ximenean' school of setting.";
    default:
      return "A setter with a distinct and unique style.";
  }
};

export const getClueTypeExplanation = (clueType: ClueType): string => {
  switch (clueType) {
    case ClueType.ANY: return "Let the AI choose the most suitable clue type for the answer.";
    case ClueType.ANAGRAM: return "The answer is an anagram (rearrangement) of letters from other words in the clue.";
    case ClueType.CHARADE: return "The answer is built by combining smaller words or abbreviations (e.g., CAR + PET = CARPET).";
    case ClueType.CONTAINER: return "The answer is formed by placing one word inside another (e.g., BRAIN from B(RA)IN).";
    case ClueType.REVERSAL: return "The answer is a word spelled backwards, often indicated by directional words like 'up' or 'returning'.";
    case ClueType.HOMOPHONE: return "The answer sounds like another word or phrase, indicated by words like 'we hear' or 'reportedly'.";
    case ClueType.DOUBLE_DEFINITION: return "The clue provides two different, distinct definitions for the same answer.";
    case ClueType.DELETION: return "The answer is formed by removing letters from a word (e.g., 'endless' or 'heartless').";
    case ClueType.HIDDEN_WORD: return "The answer is hidden consecutively within the letters of the clue itself.";
    case ClueType.SPOONERISM: return "The initial sounds of two words are swapped to create a new phrase that clues the answer.";
    case ClueType.CRYPTIC_DEFINITION: return "A purely witty or misleading clue where the whole phrase is a metaphorical definition of the answer.";
    default: return "A specific type of cryptic wordplay.";
  }
};

export const getSynonyms = async (text: string): Promise<string[]> => {
    try {
        const prompt = `You are a thesaurus. Provide a short list of useful, single-word or short-phrase synonyms for the given word/phrase. Prioritize common and interesting alternatives. Return the output as a single, flat JSON array of strings.

Word/Phrase: "${text}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const synonyms = extractAndParseJson<string[]>(response.text);

        if (!Array.isArray(synonyms) || !synonyms.every(s => typeof s === 'string')) {
            throw new Error("AI returned data in an invalid format.");
        }

        return synonyms.slice(0, 15); // Limit to 15 suggestions
    } catch (error) {
        throw handleApiError(error);
    }
};


export const generateClue = async (
  answer: string,
  definition: string,
  clueType: ClueType,
  isToughie: boolean,
  setter: string,
  theme: string
): Promise<GeneratedClue> => {
  const prompt = `You are an expert cryptic crossword setter, a master of wit, misdirection, and wordplay. Your task is to generate a single, high-quality cryptic crossword clue based on the user's request.

**INSTRUCTIONS:**
1.  **Emulate the Setter**: Adopt the persona and style of the specified setter.
2.  **Use the Clue Type**: Strictly adhere to the requested clue type. If 'ANY' is specified, choose the most elegant and clever type for the given answer.
3.  **Integrate the Theme**: If a theme is provided, subtly weave it into the 'surface reading' of the clue. The surface reading should be a natural, grammatical, and often misleading sentence.
4.  **Difficulty**: Adjust the difficulty based on the 'Toughie' setting and the setter's reputation.
5.  **Output Format**: Respond ONLY with a single, valid JSON object with a single key: "clue" (the final clue text). Do not include any other text, keys, or markdown formatting.

**STYLE BENCHMARKS:**
Study these examples of superb clues. Aim for this level of elegance and wit:
- 1 getting Tesla — bet he crashes! (3,7) — THE BEATLES
- Senior officers kiss cheek (5,4) — BRASS NECK
- Blue bottle getting passed around (10) — DISPIRITED
- Pet butterfly? (6) — STROKE

**USER REQUEST:**
- Answer: "${answer}"
- Definition: "${definition}"
- Clue Type: "${clueType}"
- Setter Style: "${setter}"
- Theme: "${theme === 'None' || !theme ? 'No specific theme' : theme}"
- Toughie Mode: ${isToughie ? 'Yes, make it very difficult.' : 'No, standard difficulty.'}

Now, generate the clue.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    const result = extractAndParseJson<{ clue: string }>(response.text);

    if (typeof result.clue !== 'string' || !result.clue) {
      throw new Error("AI response did not contain a valid clue.");
    }

    return {
      clue: result.clue,
      setter, // Return the requested setter style
      answer
    };
  } catch (error) {
    throw handleApiError(error);
  }
};