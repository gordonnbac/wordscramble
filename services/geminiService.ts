import { GoogleGenAI, Type } from "@google/genai";
import { Puzzle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const puzzleSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      solution: {
        type: Type.STRING,
        description: 'The solution phrase. Can be one or more words. e.g., "Robin" or "Fallow Deer".'
      },
      jumbledWord: {
        type: Type.STRING,
        description: 'A jumbled, anagram version of all the letters in the solution, with spaces removed.'
      },
      hint: {
        type: Type.STRING,
        description: 'A short, one-sentence hint for the solution phrase.'
      },
      wordCount: {
        type: Type.NUMBER,
        description: 'The number of words in the solution phrase.'
      }
    },
    required: ["solution", "jumbledWord", "hint", "wordCount"]
  }
};

export const generatePuzzles = async (theme: string): Promise<Puzzle[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 word puzzles for a word jumble game. The theme is "${theme}".
      For each puzzle, provide:
      1.  'solution': A solution phrase. It can be a multi-word phrase if that is the most accurate answer (e.g., 'Fallow Deer' instead of just 'fallow'). The total letter count (excluding spaces) should be between 5 and 12.
      2.  'jumbledWord': A jumbled, anagram version of all the letters from the solution, with any spaces removed.
      3.  'hint': A short, one-sentence hint for the solution.
      4.  'wordCount': The number of words in the solution.

      Crucially, the solution must be a specific *example* of the theme, not just a related concept. For example, if the theme is 'British Birds', a correct solution is 'ROBIN', but 'FEATHER' would be incorrect. If the theme is 'UK 60s Music Bands', a correct solution is 'BEATLES', not 'MERSEYBEAT'.

      IMPORTANT: For themes related to geography, flora, or fauna (e.g., animals, birds, flowers), please assume a British context unless the theme explicitly states another region (e.g., 'North American Birds').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: puzzleSchema,
      },
    });

    const jsonText = response.text.trim();
    const puzzles = JSON.parse(jsonText) as Puzzle[];

    // Validate that the AI followed instructions
    return puzzles.filter(p => p.solution && p.jumbledWord && p.hint && p.wordCount > 0);

  } catch (error) {
    console.error("Error generating puzzles with Gemini:", error);
    throw new Error("Failed to generate puzzles. The AI might be busy, or the theme might be too restrictive. Please try again.");
  }
};