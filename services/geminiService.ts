
import { GoogleGenAI, Type } from "@google/genai";
import { AiSummary } from "../types";

export const generateArticleInsights = async (title: string, content: string): Promise<AiSummary> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Clean HTML for token efficiency
  const plainText = content.replace(/<[^>]*>?/gm, '').substring(0, 5000);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this Wikipedia article about "${title}". Content: ${plainText}`,
    config: {
      systemInstruction: "You are a research assistant. Provide high-level insights about the given article in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tldr: { type: Type.STRING, description: "A one-sentence summary of the article." },
          keyPoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 to 5 key takeaways." 
          },
          context: { type: Type.STRING, description: "Historical or cultural context of the topic." },
          funFact: { type: Type.STRING, description: "One surprising or interesting fact from the content." }
        },
        required: ["tldr", "keyPoints", "context", "funFact"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not generate AI insights.");
  }
};
