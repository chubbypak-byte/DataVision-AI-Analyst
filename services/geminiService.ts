
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SolutionOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured analysis output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.INTEGER, description: "20, 50, 70, or 100" },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          executiveBenefits: { type: Type.STRING, description: "ประโยชน์ต่อผู้บริหาร ROI และการตัดสินใจ" },
          operationalBenefits: { type: Type.STRING, description: "ประโยชน์ต่อคนทำงาน ความง่าย ความเร็ว" },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          developmentTools: { type: Type.STRING, description: "ระบุเครื่องมือหลักที่จะใช้พัฒนา เช่น Excel Macro, Power Apps, React, Python หรือ Platform สำเร็จรูป" },
          visualization: { type: Type.STRING, description: "กลยุทธ์ภาพรวมการแสดงผลข้อมูล (General Strategy)" },
          concreteOutputs: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "ระบุผลลัพธ์ที่เป็นรูปธรรมอย่างน้อย 3-4 ข้อ เช่น 'Map Heatmap แสดงความหนาแน่น', 'Bubble Map เปรียบเทียบยอดขาย', 'Line Notify แจ้งเตือนทันที', 'Webex Alert รายวัน'" 
          }
        },
        required: ["level", "title", "description", "executiveBenefits", "operationalBenefits", "technologies", "developmentTools", "visualization", "concreteOutputs"]
      }
    }
  },
  required: ["options"]
};

export const analyzeExcelContext = async (
  headers: string[], 
  sampleData: any[]
): Promise<AnalysisResult> => {
  
  const prompt = `
    Role: Senior Chief Technology Officer & Data Strategist
    Task: วิเคราะห์โครงสร้างข้อมูลจากไฟล์ Excel และเสนอทางเลือกในการพัฒนาซอฟต์แวร์ 4 ระดับ (4 Options)
    
    Data Headers: ${JSON.stringify(headers)}
    Sample Data: ${JSON.stringify(sampleData)}
    
    โปรดเสนอ 4 ทางเลือก (20%, 50%, 70%, 100%) โดยแต่ละข้อต้องระบุรายละเอียดให้ครบถ้วน:
    
    1. Executive Benefits (ผู้บริหารได้อะไร?)
    2. Operational Benefits (คนทำงานสบายขึ้นอย่างไร?)
    3. Development Tools (เจาะจงเครื่องมือที่จะใช้ทำ เช่น Excel VBA, Power BI, Node.js, Python)
    4. Visualization Strategy (กลยุทธ์ภาพรวม)
    5. **Concrete Outputs (สำคัญมาก)**: ต้องระบุรูปแบบการแสดงผลหรือการแจ้งเตือนที่เป็นรูปธรรมและเหมาะสมกับข้อมูลชุดนี้ที่สุด เช่น:
       - ถ้ามีข้อมูลพื้นที่/จังหวัด: ให้เสนอ "Heatmap แสดงความหนาแน่น", "Bubble Map ตามพิกัด", "Map Dashboard"
       - ถ้าเป็นข้อมูล Transaction/Stock: ให้เสนอ "Line Notify แจ้งเตือนเมื่อของหมด", "Webex Bot สรุปยอดรายชั่วโมง"
       - ถ้าเป็นข้อมูลเปรียบเทียบ: ให้เสนอ "Bar Chart Race", "Sankey Diagram", "Treemap"
       - ระบุให้ชัดเจนว่าจะเป็น Dashboard, Notification, หรือ Report แบบไหน
    
    6. Technologies (Stack ทางเทคนิค)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.5
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("ไม่ได้รับข้อมูลตอบกลับจาก Gemini");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  selectedOption: SolutionOption | null
): Promise<AsyncGenerator<string, void, unknown>> => {
  
  const context = selectedOption 
    ? `User Selected Option: ${selectedOption.title} (Level ${selectedOption.level}%)\nTools: ${selectedOption.developmentTools}\nVisualization: ${selectedOption.visualization}\nConcrete Outputs: ${selectedOption.concreteOutputs.join(', ')}`
    : `User has not selected a specific option yet.`;

  const systemInstruction = `
    คุณคือ AI Consultant ผู้เชี่ยวชาญ
    บริบท: ${context}
    
    หน้าที่:
    1. ตอบคำถามภาษาไทย ให้กระชับ ทันสมัย และเป็นมืออาชีพ
    2. เน้นการให้คำปรึกษาเชิงเทคนิคและการบริหารจัดการที่เกี่ยวข้องกับทางเลือกที่ผู้ใช้สนใจ
    3. หากถูกถามเรื่องการแสดงผล ให้แนะนำตาม Concrete Outputs ที่ระบุไว้ (เช่น Heatmap, Line Notify) และขยายความวิธีการทำได้
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    
    return (async function* () {
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) yield text;
      }
    })();

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};
