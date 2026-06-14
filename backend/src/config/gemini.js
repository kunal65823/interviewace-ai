import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getGeminiModel = (overrides = {}) => {
  return genAI.getGenerativeModel(
    {
      model: overrides.model || GEMINI_MODEL,
      generationConfig: {
        temperature: overrides.temperature ?? 0.7,
        responseMimeType: 'application/json',
        ...overrides.generationConfig,
      },
    },
    { apiVersion: 'v1beta' }
  );
};

/**
 * Generic helper to prompt Gemini and parse a JSON response.
 * Throws if the response cannot be parsed as JSON.
 */
export const generateJSON = async (prompt, overrides = {}) => {
  const model = getGeminiModel(overrides);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    // Fallback: try to extract JSON block if model wrapped it in markdown
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[1] || match[0]);
    }
    throw new Error(`Failed to parse Gemini response as JSON: ${err.message}`);
  }
};

export default genAI;