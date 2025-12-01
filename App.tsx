
import React, { useState } from 'react';
import { parseExcelPreview } from './services/excelService';
import { analyzeExcelContext } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { AnalysisResult } from './types';
import { Rocket, Sparkles, ChevronLeft, Database } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Parse Excel locally
      const { headers, sampleData } = await parseExcelPreview(file);
      
      // 2. Send to Gemini (No wowFactor needed anymore, it generates 4 options)
      const result = await analyzeExcelContext(headers, sampleData);
      
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen font-prompt text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* Space Background Layer */}
      <div className="fixed inset-0 z-0 bg-[#020617]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetAnalysis}>
            <div className="bg-slate-800 p-2 rounded-xl border border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-lg shadow-cyan-900/20">
              <Rocket className="w-5 h-5 text-cyan-400 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none tracking-tight">
                DataVision <span className="text-cyan-400">AI</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase">Executive Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-slate-800/80 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               SYSTEM READY
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {/* LANDING / CONFIG STATE */}
        {!analysisResult && (
          <div className="max-w-3xl mx-auto space-y-12 animate-float">
            <header className="text-center space-y-6 pt-10">
              <div className="inline-block px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-900/20 text-violet-300 text-xs font-bold tracking-widest uppercase mb-2">
                Senior Developer & Executive Tool
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
                ขับเคลื่อนข้อมูลดิบ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400">สู่กลยุทธ์การตัดสินใจ</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                เครื่องมือการวิเคราะห์ข้อมูล เพื่อพัฒนาให้เป็นอาวุธในการกำหนดกลยุทธองค์กร
              </p>
            </header>

            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

              <FileUpload onFileSelect={handleFileSelect} />
              
              {file && (
                <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-4 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-950 rounded-lg border border-cyan-500/20">
                      <Database className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB • พร้อมวิเคราะห์</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-xs text-slate-500 hover:text-red-400 font-medium transition-colors uppercase tracking-wider"
                  >
                    ยกเลิก (Cancel)
                  </button>
                </div>
              )}
              
              <div className="pt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden
                    ${!file || isAnalyzing 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] hover:scale-[1.02] border border-cyan-400/30'}
                  `}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="animate-pulse">กำลังประมวลผลทางเลือก...</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                      <Sparkles className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">เริ่มวิเคราะห์ (Generate 4 Options)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-300 px-6 py-4 rounded-xl text-center text-sm font-medium backdrop-blur-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* RESULTS STATE */}
        {analysisResult && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={resetAnalysis}
                className="group flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-sm font-medium backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                เริ่มใหม่ (Start Over)
              </button>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>
            
            <AnalysisView result={analysisResult} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
