// FIX: This file was a placeholder and has been implemented to generate puzzles using the Gemini API.
import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Puzzle } from '../src/types'; // Correctly import the Puzzle type

// Helper function for robust type validation
function isValidPuzzle(obj: any): obj is Puzzle {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.jumbledWord === 'string' &&
        typeof obj.solution === 'string' &&
        typeof obj.hint === 'string' &&
        typeof obj.wordCount === 'number'
    );
}

// Initialize the Gemini client. 
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Define the response schema for a single puzzle, to ensure structured output from the AI.
const puzzleSchema = {
  type: Type.OBJECT,
  properties: {
    jumbledWord: {
      type: Type.STRING,
      description: 'The scrambled version of the word or phrase.',
    },
    solution: {
      type: Type.STRING,
      description: 'The correct, unscrambled word or phrase, between 4 and 20 characters long.',
    },
    hint: {
      type: Type.STRING,
      description: 'A short, clever clue to help the user guess the solution.',
    },
    wordCount: {
      type: Type.INTEGER,
      description: 'The number of words in the solution (e.g., 1 for "cat", 2 for "ice cream").',
    },
  },
  required: ['jumbledWord', 'solution', 'hint', 'wordCount'],
};

// Define the schema for the array of puzzles
const puzzlesSchema = {
  type: Type.ARRAY,
  items: puzzleSchema,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    return res.status(500).json({ error: "Server configuration error: API key not found." });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { theme } = req.body;

  if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
    return res.status(400).json({ error: 'Theme is required and must be a non-empty string.' });
  }

  try {
    const prompt = `Generate 5 word scramble puzzles for the theme: "${theme}". Ensure solutions are between 4 and 20 characters. The jumbled word must be a good anagram. If the solution is multi-word, scramble letters within each word but keep word order. Provide a hint and the word count for each.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: puzzlesSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text;
    const parsedResponse: unknown = JSON.parse(jsonText.trim());

    if (!Array.isArray(parsedResponse)) {
        throw new Error("AI response was not in the expected array format.");
    }

    const validPuzzles = parsedResponse.filter(isValidPuzzle);
    
    if (validPuzzles.length === 0) {
        throw new Error("AI failed to generate any valid puzzles for the theme.");
    }

    return res.status(200).json(validPuzzles);
  } catch (error) {
    console.error("Error generating puzzles with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return res.status(500).json({ error: `The AI failed to generate puzzles for this theme. Please try another. (${errorMessage})` });
  }
}
