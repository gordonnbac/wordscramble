// FIX: Replaced placeholder content with a valid Gemini API implementation.
import { GoogleGenAI, Type } from "@google/genai";
import { Puzzle } from '../types';

// This is a generic handler that should work in most serverless environments
// like Vercel or Netlify that use Vite.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { theme } = await req.json();

    if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Theme is required and cannot be empty.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Create a list of 5 word puzzles for a game. The theme is "${theme}".
      Each puzzle must be an object with the following properties: "solution", "jumbledWord", "hint", and "wordCount".
      - "solution": A word or phrase related to the theme. Must be between 4 and 15 characters total (excluding spaces).
      - "jumbledWord": The solution, but with its letters scrambled. This MUST be a single string with no spaces, even for multi-word solutions.
      - "hint": A short clue for the solution.
      - "wordCount": The number of words in the solution (e.g., 1 for "Telescope", 2 for "Big Dipper").
      The difficulty should be medium. Ensure the jumbled word is not the same as the solution.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              solution: {
                type: Type.STRING,
                description: 'The solution word or phrase.'
              },
              jumbledWord: {
                type: Type.STRING,
                description: 'The scrambled solution, as a single word.'
              },
              hint: {
                type: Type.STRING,
                description: 'A clue for the solution.'
              },
              wordCount: {
                type: Type.INTEGER,
                description: 'The number of words in the solution.'
              },
            },
            required: ['solution', 'jumbledWord', 'hint', 'wordCount'],
          },
        },
      },
    });

    const puzzlesText = response.text.trim();
    // Basic validation to ensure we got something that looks like JSON array
    if (!puzzlesText.startsWith('[') || !puzzlesText.endsWith(']')) {
      console.error("Gemini response was not a valid JSON array:", puzzlesText);
      throw new Error("The AI returned an invalid response format.");
    }
    const puzzles: Puzzle[] = JSON.parse(puzzlesText);

    return new Response(JSON.stringify(puzzles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in generate-puzzles API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: `Failed to generate puzzles. ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
