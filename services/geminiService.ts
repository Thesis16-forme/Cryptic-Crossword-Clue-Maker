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

const handleApiError = (error: unknown): Error => {
  console.error("Gemini API Error:", error);

  // Convert the error to a lowercase string for consistent checking
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message.toLowerCase();
  } else {
    try {
      // Handles cases where the error is an object (like the API response)
      errorMessage = JSON.stringify(error).toLowerCase();
    } catch (e) {
      // Fallback for non-stringifiable types
      errorMessage = String(error).toLowerCase();
    }
  }
  
  // API Key issues
  if (errorMessage.includes("api key not valid") || errorMessage.includes("api_key_not_valid") || errorMessage.includes("not found")) {
    return new Error("Invalid API Key. Please check your configuration and try again.");
  }
  // Quota issues
  if (errorMessage.includes("quota") || errorMessage.includes("resource_exhausted")) {
    return new Error("You have exceeded your API quota. Please check your plan and billing details, or try again later.");
  }
  // Rate limiting issues
  if (errorMessage.includes("rate limit")) {
    return new Error("You've made too many requests in a short period. Please wait a moment and try again.");
  }
  // Content safety issues
  if (errorMessage.includes("candidate was blocked")) {
    return new Error("The request was blocked for safety reasons. Please modify your input and try again.");
  }
  // Network issues (client-side)
  if (errorMessage.includes("failed to fetch")) {
      return new Error("Network error. Please check your internet connection and try again.");
  }
  // Server-side issues (5xx errors)
  if (errorMessage.includes("server error") || errorMessage.includes("500") || errorMessage.includes("503") || errorMessage.includes("service unavailable")) {
      return new Error("The AI service is currently unavailable. Please try again in a few moments.");
  }
  // Badly formatted response from AI
  if (errorMessage.includes("unexpected format") || errorMessage.includes("invalid response")) {
      return new Error("The AI returned a response in an unexpected format. Please try again.");
  }
  
  // Default fallback error for other unhandled cases
  return new Error("An unexpected error occurred with the AI service. Please try again later.");
};

export const getSetterExplanation = (setter: string): string => {
  switch (setter) {
    case "Anax":
      return "A modern master of the difficult puzzle. Anax is known for highly inventive, sometimes fiendishly complex clues with brilliant surface readings. His puzzles often push the boundaries of cluing conventions and are a tough but rewarding challenge for experts.";
    case "Araucaria":
      return "Known for his playful, liberal, and often humorous style. His clues frequently feature elaborate themes. He was a master of the misleading surface reading and wasn't afraid to bend the 'rules' for the sake of a great clue. Expect wit and invention.";
    case "Azed":
      return "A torchbearer of the Ximenean tradition, known for his advanced, highly challenging puzzles. Azed clues are scrupulously fair but demand a large vocabulary, as he frequently uses obscure and archaic words. Tough but rewarding for the connoisseur.";
    case "Boatman":
      return "A master of the themed puzzle. Nearly every clue's surface reading will cleverly relate to the puzzle's central theme, creating a wonderfully cohesive and immersive experience. He uses a wide variety of inventive clue types.";
    case "Bunthorne":
      return "A classic and respected setter. Bunthorne's style is characterized by its wit, elegance, and smooth surface readings. His clues are generally fair and well-constructed, providing a satisfying challenge without being overly obscure or wild.";
    case "Cinephile":
      return "The pseudonym of the late, great Araucaria. As the name suggests, his puzzles were often infused with themes from the world of film. The style is playful, witty, and highly entertaining.";
    case "Dac":
       return "Widely regarded for his smooth, natural surface readings and scrupulously fair clues. Dac's puzzles are a model of elegance and consistency, providing a satisfying and accessible challenge that is witty without being overly difficult. A true craftsman.";
    case "Enigmatist":
      return "One of the toughest setters out there. Enigmatist's clues are notoriously difficult, featuring intricate, multi-layered wordplay and fiendishly misleading definitions. A serious undertaking reserved for expert solvers.";
    case "Everyman":
      return "The traditional name for The Observer's beginner-friendly puzzle. Everyman clues are a perfect starting point, designed to be straightforward and scrupulously fair. Ideal for learning the ropes of cryptic crosswords.";
    case "Gordius":
      return "Known for his sharp wit and a tendency to weave left-leaning political and social commentary into his puzzles. Gordius's clues often have a satirical edge, with surface readings that poke fun at current events or public figures.";
    case "Pasquale":
      return "A highly prolific setter and linguist, his clues are known for their precision and economy of language. He often has a slightly academic or high-brow feel, but the wordplay is always fair and logical, following the Ximenean tradition closely.";
    case "Paul":
      return "One of the most popular modern setters, famous for his wit, humour, and a love of mischievous, schoolboyish vulgarity. His clues are often laugh-out-loud funny and known for clever use of innuendo, but the underlying wordplay is brilliant.";
    case "Picaroon":
       return "A highly popular Guardian setter, known for his mischievous wit and superbly constructed clues. Picaroon (also known as Buccaneer) blends clever wordplay with entertaining surfaces, often with a modern and topical flavour. His puzzles are fun and challenging in equal measure.";
    case "Rufus":
      return "A master of the gentle cryptic, perfect for beginners. His puzzles rely heavily on witty cryptic definitions and double definitions, with less emphasis on complex wordplay. The goal is fun and a satisfying 'aha!' moment.";
    case "Shed":
      return "Shares a similar humorous and inventive style with Paul. His clues are witty and enjoyable, with excellent surface readings. Slightly less prone to overt cheekiness than Paul but delivers an equally satisfying and fun solving experience.";
    case "Torquemada":
      return "One of the earliest setters, known for puzzles of legendary difficulty. His clues were often wilfully obscure and didn't always follow the strict rules of modern cryptics. Selecting his style will produce very challenging and old-fashioned clues.";
    case "Vlad":
       return "As his pseudonym 'The Impaler' suggests, Vlad's puzzles can be tough. He is known for his dark wit, clever misdirection, and intricate wordplay. His clues often have a slightly edgy or political feel and demand careful, precise solving.";
    case "Ximenes":
      return "The father of modern cryptic crossword rules ('Ximenean principles'). His style is defined by its absolute fairness and precision. Expect grammatically perfect wordplay, no ambiguity, and a strict adherence to logic. Elegant but very challenging due to its exactness.";
    default:
      return "Select a setter to see their stylistic description.";
  }
};

export const getClueTypeExplanation = (clueType: ClueType): string => {
  switch (clueType) {
    case ClueType.ANY:
      return "Let the AI choose! Selects a random, suitable clue type for your answer and definition.";
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
    case ClueType.ALTERNATION:
        return "An alternation. The answer is formed by taking letters alternately from two or more other words. The clue will contain indicators like 'alternately', 'regularly', or 'every other'. For example, for SCARE, the clue might define SAC and RED and then say 'take every other letter'.";
    case ClueType.ODD_EVEN_LETTERS:
        return "Odd/Even letters. The answer is formed by taking either the odd-positioned or even-positioned letters from a word in the clue. Indicators include 'oddly', 'evenly', 'regularly ignoring', etc. For example, for ATE, the clue might use the word 'gATEway' and the indicator 'oddly'.";
    case ClueType.SOUND_CHANGE:
        return "A sound change. The answer is formed by changing a letter or sound within a word to another. The clue will define the original word and indicate the change, e.g., 'change X to Y'. For example, for WANE, the clue might define WINE and instruct 'change the sound of I to A'.";
    case ClueType.REBUS:
        return "A 'meta' clue where the answer itself is a piece of wordplay. The clue has a definition for the answer, plus wordplay that describes the *result* of the answer's instructions. For example, for the answer BROKEN HEART (a term for 'despair'), the clue's wordplay might be 'Earth', because 'heart' when 'broken' (anagrammed) becomes 'earth'.";
    case ClueType.BACKSOLVER:
        return "A backsolver (or indirect) clue. The answer is often an obscure word or proper noun that is difficult to solve directly. The clue provides a cryptic hint, and the solver is expected to use the letters from intersecting clues ('checking letters') to determine the final answer. This type is rare and considered unfair by some purists.";
    case ClueType.ANTHROPOPHAGISM:
        return "A very rare 'man-eats-word' clue. This is a specific type of container where a word for a person (e.g., 'MAN', 'SON', 'HE') 'eats' (contains) another word to form the answer. The indicator is often related to cannibalism. For example, to get 'REHEARSAL', the clue might have 'HE' eating 'REARS' (backs).";
    case ClueType.LETTER_BANK:
        return "A letter bank. The clue contains a word or phrase from which all the letters of the answer can be taken, but not necessarily in order or contiguously (unlike a hidden word or anagram). It requires an indicator like 'letters from', 'using characters in', etc. For example, for ANSWER from 'WAREHOUSEMAN', the clue would indicate to pick letters from the longer word.";
    case ClueType.LETTER_PAIR:
        return "A letter pair clue. The answer is formed by taking pairs of letters from words in the clue. Indicators might specify 'first couple', 'final pair', 'central duo', etc. For example, for CART, the clue might define 'CARthorse' and use an indicator like 'opening couple'.";
    case ClueType.ACRONYM:
      return "An acronym. Similar to an initialism, but the answer forms a pronounceable word (e.g., RADAR, NATO). The clue takes the first letters from a phrase, often indicated by words like 'initially' or 'at first'. The clue must define the acronym.";
    case ClueType.BACKRONYM:
      return "A backronym. A very creative and often humorous clue type where the answer word is treated as if it were an acronym, and the clue provides the phrase it supposedly stands for. For example, for the answer 'FEAR', the clue might be 'Forget everything and run!'.";
    case ClueType.ANAGRAM_INDICATOR:
      return "A special request for generating examples of indicator words. Anagram indicators (e.g., 'wild', 'damaged', 'novel', 'mixed-up') are used in clues to signal that letters should be rearranged. Note: This does not generate a full crossword clue.";
    case ClueType.REVERSAL_INDICATOR:
      return "A special request for generating examples of indicator words. Reversal indicators (e.g., 'back', 'returns', 'reflects', 'going west') are used in clues to signal that a word should be spelled backwards. Note: This does not generate a full crossword clue.";
    case ClueType.HIDDEN_INDICATOR:
      return "A special request for generating examples of indicator words. Hidden indicators (e.g., 'some', 'part of', 'in', 'within') are used in clues to signal that the answer is concealed inside a phrase. Note: This does not generate a full crossword clue.";
    case ClueType.CONTAINER_INDICATOR:
      return "A special request for generating examples of indicator words. Container indicators (e.g., 'swallows', 'around', 'holds', 'outside') are used in clues to signal that one word should be placed inside another. Note: This does not generate a full crossword clue.";
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
                throw new Error("The AI returned an invalid response for synonyms.");
            }
            return parsedResponse;
        } catch (e) {
            console.error("Failed to parse synonyms response as JSON:", responseText, e);
            throw new Error("The AI returned a response for synonyms in an unexpected format.");
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
    setter: string,
    theme: string,
): Promise<GeneratedClue> => {
  const toughieInstruction = isToughie 
    ? `
**Difficulty:** This is a 'Toughie' clue. Increase the difficulty significantly. Use more obscure vocabulary, subtler indicators, and more complex or layered wordplay. The surface reading should be exceptionally misleading.`
    : `
**Difficulty:** Standard difficulty. The clue should be challenging but fair for an average solver.`;

  const themeInstruction = (theme && theme.trim() && theme.toLowerCase() !== 'none')
    ? `
**Thematic Element:**
You MUST incorporate the following theme into the clue's surface reading or wordplay. The connection can be subtle, but the clue should feel relevant to the topic. For example, if the theme is 'Science', the surface reading could sound like a lab note, or an indicator word could be a scientific term.
- **Theme:** "${theme}"`
    : '';

  const setterStyleExplanation = getSetterExplanation(setter);

  const prompt = `
    You are an expert cryptic crossword setter. Your task is to generate one concise, elegant, and witty cryptic crossword clue.

    **Style and Persona:**
    Adopt the persona of the famous cryptic crossword setter: **${setter}**.
    Emulate this setter's specific style: "${setterStyleExplanation}"
    You MUST strictly adhere to this style in your response.

    ${themeInstruction}

    **Clue Complexity:**
    Vary the complexity based on the chosen wordplay type. For instance, a DOUBLE_DEFINITION should be simple and elegant, while a COMPOSITE clue should naturally be more intricate and layered.
    ${toughieInstruction}

    **Wordplay Sophistication:**
    - **Prioritize Creativity:** Strive for clever, sophisticated wordplay. Avoid using the most common or obvious synonyms for components of the answer. Instead, seek out more creative, less direct, but still fair, word associations to make the clue more rewarding and create a satisfying "aha!" moment.

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
      "setter": "${setter}",
      "answer": "${answer}"
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
        if (!parsedResponse.clue || !parsedResponse.setter || !parsedResponse.answer) {
            throw new Error("AI response is missing required fields (invalid response).");
        }
        return parsedResponse;
    } catch (e) {
        console.error("Failed to parse AI response as JSON:", text, e);
        throw new Error("The AI returned a response in an unexpected format.");
    }

  } catch (error) {
    throw handleApiError(error);
  }
};