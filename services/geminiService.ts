import { GoogleGenAI } from "@google/genai";
import { type Message } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

export const getChatResponse = async (history: Message[], newMessage: string): Promise<string> => {
    try {
        const chatHistory = history.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        const systemInstruction = `당신은 유능한 프로젝트 관리 어시스턴트입니다. 당신의 역할은 사용자 요청을 이해하고, 명확하고 간결한 답변을 제공하는 것입니다. 모든 답변은 한국어로 작성해주세요.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [...chatHistory, { role: 'user', parts: [{ text: newMessage }] }],
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("AI 모델과 통신하는 데 실패했습니다.");
    }
};
