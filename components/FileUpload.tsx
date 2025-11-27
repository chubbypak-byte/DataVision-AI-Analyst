import React from 'react';
import { UploadCloud, FileSpreadsheet, Atom } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && (files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.xls'))) {
      onFileSelect(files[0]);
    } else {
      alert("กรุณาอัปโหลดไฟล์ Excel (.xlsx, .xls) เท่านั้น");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div 
      className="relative w-full border border-cyan-500/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden group cursor-pointer bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        type="file" 
        id="fileInput" 
        accept=".xlsx, .xls" 
        className="hidden" 
        onChange={handleFileInput}
      />
      
      {/* Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
        <div className="relative bg-slate-950 p-5 rounded-2xl shadow-lg border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300 ring-1 ring-cyan-500/50">
          <FileSpreadsheet className="w-10 h-10 text-cyan-400" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-wide font-prompt">
        อัปโหลดไฟล์ข้อมูล <span className="text-cyan-400">Mission Data</span>
      </h3>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
        ลากไฟล์ Excel มาวางที่นี่ หรือคลิกเพื่อค้นหาไฟล์ <br/>รองรับ .xlsx และ .xls
      </p>
      
      <button className="px-8 py-3 bg-cyan-500/10 text-cyan-300 border border-cyan-500/50 rounded-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-500/20 hover:text-cyan-200 transition-all text-sm uppercase tracking-wider flex items-center gap-2">
        <Atom className="w-4 h-4" />
        เลือกไฟล์จากเครื่อง
      </button>
    </div>
  );
};