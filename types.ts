
export interface SolutionOption {
  level: number; // 20, 50, 70, 100
  title: string;
  description: string;
  executiveBenefits: string;
  operationalBenefits: string;
  technologies: string[];
  developmentTools: string; // New: เครื่องมือหลักที่ใช้
  visualization: string;    // New: รูปแบบการแสดงผลข้อมูล (General Strategy)
  concreteOutputs: string[]; // New: ตัวอย่างผลลัพธ์ที่เป็นรูปธรรม (Heatmap, Line Notify, etc.)
}

export interface AnalysisResult {
  options: SolutionOption[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
