
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

    *** DOMAIN KNOWLEDGE (กฎทางธุรกิจและคำศัพท์เฉพาะ) ***
    1. Context: ระบบจัดการพลังงานไฟฟ้า (Energy Management & Meter Reading)
    2. "unit": คือ หน่วยไฟฟ้า (Energy Unit) 
       - เงื่อนไขสำคัญ: ค่าสามารถเป็น 0.00 ได้ (ปกติ) แต่ **ห้ามเป็นค่าว่าง (Null/Empty)** โดยเด็ดขาด หากพบค่าว่างคือความผิดปกติ
    3. "station": คือ สถานีอ่านหน่วยมิเตอร์ (Meter Reading Station) ใช้ระบุจุดวัดและติดตามหน่วยไฟ
    4. "PEA": คือ การไฟฟ้าส่วนภูมิภาค (Provincial Electricity Authority)
    5. "pea_export": คือ หน่วยไฟฟ้าที่ระบบจ่ายออกไปให้ PEA (ขายคืน/จ่ายออก)
    6. "pea_import": คือ หน่วยไฟฟ้าที่รับเข้ามาจาก PEA (ซื้อเข้า/รับเข้า)
    
    โปรดเสนอ 4 ทางเลือก (20%, 50%, 70%, 100%) โดยแต่ละข้อต้องระบุรายละเอียดให้ครบถ้วน:
    
    1. Executive Benefits (ผู้บริหารได้อะไร? เช่น การ Balance Load, การลดค่าใช้จ่ายจากการวิเคราะห์ Import/Export)
    2. Operational Benefits (คนทำงานสบายขึ้นอย่างไร? เช่น ระบบแจ้งเตือนเมื่อพบ Unit ว่างเปล่า, การบันทึกค่า 0.00 ได้ถูกต้อง)
    3. Development Tools (เจาะจงเครื่องมือที่จะใช้ทำ)
    4. Visualization Strategy (กลยุทธ์ภาพรวม)
    5. **Concrete Outputs (สำคัญมาก)**: ต้องระบุรูปแบบการแสดงผลหรือการแจ้งเตือนที่เป็นรูปธรรมและเหมาะสมกับบริบทไฟฟ้า เช่น:
       - **Validation**: "Line Notify แจ้งเตือนทันทีเมื่อพบ Unit เป็นค่าว่าง", "Report ตรวจสอบ Station ที่ส่งข้อมูลไม่ครบ"
       - **Energy Balance**: "Dashboard เปรียบเทียบ pea_import vs pea_export", "Graph แสดง Trend การใช้ไฟราย Station"
       - **Map**: "Heatmap แสดง Station ที่มี Load สูง", "Map แสดงตำแหน่ง Station"
    
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
    คุณคือ AI Consultant ผู้เชี่ยวชาญด้าน Energy Data Management
    บริบท: ${context}
    
    ความรู้เฉพาะทาง (Domain Knowledge):
    - unit: เป็น 0.00 ได้ แต่ห้ามว่าง (Null)
    - station: จุดอ่านมิเตอร์
    - pea_import/export: การรับ/จ่ายไฟ กับการไฟฟ้า (PEA)
    
    หน้าที่:
    1. ตอบคำถามภาษาไทย ให้กระชับ ทันสมัย และเป็นมืออาชีพ
    2. หากมีการถามเรื่อง Data Quality ให้เน้นเรื่องการตรวจสอบค่าว่างของ Unit
    3. หากถามเรื่อง Report ให้แนะนำ Dashboard เปรียบเทียบ Import/Export
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
