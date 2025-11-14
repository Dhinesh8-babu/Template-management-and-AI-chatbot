import { GoogleGenAI } from "@google/genai";

export const enhanceText = async (text: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are an expert in customer communication. Enhance the following text to be more friendly, professional, and empathetic, while keeping the core message intact. Correct any grammar or spelling mistakes. Return only the enhanced text. Text to enhance: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing text:", error);
    throw new Error("Failed to enhance text with AI.");
  }
};

export const getSuggestedReply = async (base64Image: string, mimeType: string, context: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    
    const textPart = {
      text: `You are a friendly and helpful customer support assistant. Analyze the attached screenshot of a customer chat. Based on the conversation and the following context, generate a warm, empathetic, and helpful reply to the customer. Context: "${context || 'No additional context provided.'}". Return only the suggested reply.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error getting suggested reply:", error);
    throw new Error("Failed to get AI suggestion.");
  }
};

export const askChatbot = async (question: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error asking chatbot:", error);
    throw new Error("Failed to get a response from the chatbot.");
  }
};
