
import { GoogleGenAI, Modality } from "@google/genai";
import type { ArchitecturalImage } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-image';

// Bắt buộc: Giả sử API key được cung cấp qua biến môi trường.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("Missing Gemini API key. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates an architectural image using the Gemini API based on a prompt and input images.
 * @param prompt The text prompt describing the desired output.
 * @param images An array of input images (floor plans, elevations, references).
 * @returns A base64 encoded string of the generated image, or null if an error occurs.
 */
export const generateArchitecturalImage = async (
  prompt: string,
  images: ArchitecturalImage[]
): Promise<string | null> => {
  try {
    const imageParts = images.map(image => ({
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    }));

    const textPart = {
      text: `Based on the following architectural drawings and references, ${prompt}`,
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    // Tìm phần hình ảnh trong phản hồi
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }

    console.warn("No image data found in Gemini response", response);
    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the Gemini API.');
  }
};
