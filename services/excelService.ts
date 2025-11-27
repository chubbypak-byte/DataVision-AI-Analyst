import * as XLSX from 'xlsx';

export const parseExcelPreview = async (file: File): Promise<{ headers: string[]; sampleData: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, limited to first 10 rows to save context window
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error("File appears to be empty"));
          return;
        }

        const headers = jsonData[0] as string[];
        // Get rows 1 to 10 as sample data
        const sampleData = jsonData.slice(1, 11);

        resolve({ headers, sampleData });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};