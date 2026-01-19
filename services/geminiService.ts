
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, AppError, STANDARD_TAX_CATEGORIES } from "../types";

/**
 * Validates and extracts data using Gemini AI.
 * Includes safety checks for JSON parsing.
 */
export const extractReceiptData = async (base64Image: string): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 string to prevent payload errors
  const imageData = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData,
              },
            },
            {
              text: `Act as a professional bookkeeper. Extract the details from this receipt precisely. 
              Assign it to one of these categories: ${STANDARD_TAX_CATEGORIES.join(', ')}. 
              Return a clean JSON object.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING, description: "Symbol like $ or £" },
            category: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                },
                required: ["description", "amount"],
              },
            },
          },
          required: ["merchantName", "date", "totalAmount", "currency", "category", "items"],
        },
      },
    });

    if (!response.text) {
      throw new Error("AI returned an empty response.");
    }

    const cleanJsonText = response.text.trim();
    const result = JSON.parse(cleanJsonText);
    
    // Fallback values for security/stability
    return {
      merchantName: result.merchantName || "Unknown Merchant",
      date: result.date || new Date().toISOString().split('T')[0],
      totalAmount: result.totalAmount || 0,
      currency: result.currency || "$",
      category: result.category || "Other Business Expense",
      items: Array.isArray(result.items) ? result.items : []
    };
  } catch (err: any) {
    console.error("Gemini AI Processing Error:", err);
    throw {
      type: 'UNKNOWN',
      message: "AI failed to process the receipt safely.",
      suggestions: [
        "Check your internet connection",
        "The image might be too large or complex",
        "Verify your API key is still valid"
      ]
    } as AppError;
  }
};
