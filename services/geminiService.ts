
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getVatExplanation = async (stageData: any, totalTax: number) => {
  const prompt = `
    作为一个中国税务专家，请用通俗易懂的语言向学生解释当前的增值税链路：
    
    链路数据：${JSON.stringify(stageData)}
    总税收：${totalTax}
    
    请重点解释：
    1. 什么是进项税、销项税和抵扣机制。
    2. 为什么说增值税是“价外税”。
    3. 为什么虽然每个环节都在缴税，但最终税款其实是由消费者承担的。
    4. 结合当前数据，指出哪个环节的“增值”最大，其纳税额是如何计算的。
    
    要求：语气亲切，分条目阐述，字数在300字以内。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法获取AI专家的解释，请检查网络连接或API密钥。";
  }
};
