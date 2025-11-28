
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDocument = async (topic: string, type: string, lang: 'en' | 'th'): Promise<string> => {
  try {
    const ai = getAIClient();

    const langInstruction = lang === 'th'
      ? "You must reply strictly in Thai language. Use formal and professional Thai for the document content."
      : "You must reply in English.";

    const systemInstruction = `You are "ABDUL DOCGEN", a sophisticated AI writing assistant. 
    Your goal is to generate high-quality, professional, and engaging content. 
    Maintain a helpful and creative tone. 
    ${langInstruction}
    Format your response using Markdown. 
    If the type is 'email', format it as a proper email structure. 
    If 'article', use headings.`;

    const prompt = `Write a ${type} about the following topic: "${topic}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || (lang === 'th' ? "ไม่สามารถสร้างข้อความได้" : "No text generated.");
  } catch (error) {
    console.warn("Gemini API Error or Missing Key, falling back to mock data:", error);

    // MOCK FALLBACK
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    if (lang === 'th') {
      return `# เอกสารตัวอย่าง: ${topic}\n\nนี่คือตัวอย่างเอกสารที่สร้างขึ้นโดยระบบจำลอง (Mock Mode) เนื่องจากไม่พบ API Key หรือเกิดข้อผิดพลาดในการเชื่อมต่อ\n\n## หัวข้อหลัก\n\nเนื้อหาในส่วนนี้จะเป็นการจำลองข้อความ เพื่อให้เห็นรูปแบบการจัดวางเอกสาร โดยปกติแล้ว AI จะสร้างเนื้อหาที่เกี่ยวข้องกับ "${topic}" อย่างละเอียด\n\n- รายการที่ 1\n- รายการที่ 2\n- รายการที่ 3\n\nสรุปแล้ว ระบบสามารถทำงานได้ตามปกติในส่วนของ UI และการโต้ตอบ`;
    } else {
      return `# Mock Document: ${topic}\n\nThis is a sample document generated in **Mock Mode** because the API Key is missing or there was a connection error.\n\n## Main Section\n\nThis content is simulated to demonstrate the layout and formatting. Normally, the AI would generate detailed content regarding "${topic}".\n\n- Item 1\n- Item 2\n- Item 3\n\nIn conclusion, the UI and interaction flow are fully functional.`;
    }
  }
};

export const refineDocument = async (currentContent: string, lang: 'en' | 'th'): Promise<string> => {
  try {
    const ai = getAIClient();

    const langInstruction = lang === 'th'
      ? "Review and edit the following content in Thai. Fix grammar, spelling, and improve the professional tone. Keep the output in Thai."
      : "Review and edit the following content in English. Fix grammar, spelling, and improve the professional tone.";

    const systemInstruction = `You are an expert editor. Your job is to proofread and polish the document. Do not change the core meaning. Return the result in Markdown. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please edit and refine the following text:\n\n${currentContent}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    return response.text || currentContent;
  } catch (error) {
    console.warn("Gemini API Error (Refine), returning original content:", error);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return currentContent + (lang === 'th' ? "\n\n(แก้ไขแล้ว - Mock)" : "\n\n(Refined - Mock)");
  }
};
