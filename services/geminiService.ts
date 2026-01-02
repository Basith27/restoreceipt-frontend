import { GoogleGenAI, Type } from "@google/genai";
import { Receipt } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// We simulate a delay for better UX flow if API key is missing or for demo purposes
export const parseReceiptImage = async (base64Image: string): Promise<Partial<Receipt>> => {
  // Remove data URL prefix if present for processing
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  if (!process.env.API_KEY) {
    console.warn("No API Key provided. Returning mock data after delay.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          vendorName: "Mock Restaurant Supply Co.",
          totalAmount: 124.50,
          date: new Date().toISOString().split('T')[0],
          taxAmount: 12.45,
          confidence: 75, // Simulating low confidence to trigger UI state
          category: "Food Cost",
          items: [
            { name: "Tomatoes (kg)", qty: 5, price: 15.00 },
            { name: "Olive Oil (L)", qty: 2, price: 40.00 },
          ]
        });
      }, 2000);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, in prod detect mime
            },
          },
          {
            text: `Extract data from this receipt. Return JSON. 
            If values are unclear, make a best guess but lower the confidence score.
            Provide: vendorName, totalAmount (number), date (YYYY-MM-DD), taxAmount (number), category (guess based on items), items (array of name, qty, price), and an overall confidence score (0-100).`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendorName: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            taxAmount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  price: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
