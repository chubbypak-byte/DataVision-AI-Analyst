
import React, { useState } from 'react';
import { AnalysisResult, SolutionOption } from '../types';
import { Target, Layers, Cpu, Lightbulb, Zap, Rocket, BrainCircuit, BarChart3, Wrench, BellRing, MonitorPlay } from 'lucide-react';
import { ChatBot } from './ChatBot';

interface AnalysisViewProps {
  result: AnalysisResult;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  const [selectedOption, setSelectedOption] = useState<SolutionOption | null>(null);

  const getIcon = (level: number) => {
    switch (level) {
      case 20: return <Lightbulb className="w-6 h-6" />;
      case 50: return <Zap className="w-6 h-6" />;
      case 70: return <Rocket className="w-6 h-6" />;
      case 100: return <BrainCircuit className="w-6 h-6" />;
      default: return <Lightbulb />;
    }
  };

  const getColor = (level: number) => {
    switch (level) {
      case 20: return "emerald";
      case 50: return "blue";
      case 70: return "violet";
      case 100: return "fuchsia";
      default: return "slate";
    }
  };

  return (
    <div className="space-y-8 font-prompt pb-20">
      
      {/* 1. Options Selection Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Target className="w-6 h-6 text-cyan-400" />
          เลือกแนวทางการพัฒนา (Development Strategy)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.options.map((opt, idx) => {
            const color = getColor(opt.level);
            const isSelected = selectedOption?.level === opt.level;
            
            return (
              <div 
                key={idx}
                onClick={() => setSelectedOption(opt)}
                className={`
                  cursor-pointer relative p-5 rounded-2xl border transition-all duration-300 group overflow-hidden
                  ${isSelected 
                    ? `bg-slate-800 border-${color}-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-${color}-400` 
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600'
                  }
                `}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-${color}-400 group-hover:scale-110 transition-transform`}>
                    {getIcon(opt.level)}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md bg-${color}-500/10 text-${color}-300 border border-${color}-500/20`}>
                    {opt.level}%
                  </span>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-white mb-2 leading-tight min-h-[3rem]">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 h-[3rem]">
                    {opt.description}
                  </p>
                  
                  {/* Executive Highlight */}
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">ประโยชน์ผู้บริหาร</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{opt.executiveBenefits}</p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className={`absolute inset-0 bg-${color}-500/5 pointer-events-none`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Detailed View & Chat */}
      {selectedOption && (
        <div className="animate-fade-in space-y-8">
          
          {/* Detail Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full bg-${getColor(selectedOption.level)}-500`}></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">{selectedOption.title}</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">{selectedOption.description}</p>
                </div>
                
                <div className="space-y-4">
                  {/* Executive Benefits */}
                  <div className="flex gap-3 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                       <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-emerald-300 font-bold text-sm">ประโยชน์ระดับบริหาร (Executive Impact)</h4>
                      <p className="text-slate-400 text-sm mt-1">{selectedOption.executiveBenefits}</p>
                    </div>
                  </div>
                  
                  {/* Operational Benefits */}
                  <div className="flex gap-3 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                       <Layers className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-blue-300 font-bold text-sm">ประโยชน์ระดับปฏิบัติการ (Operational Impact)</h4>
                      <p className="text-slate-400 text-sm mt-1">{selectedOption.operationalBenefits}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Tech & Tools Section */}
                <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 space-y-5">
                   
                   {/* Tools */}
                   <div>
                      <h4 className="text-sm font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> เครื่องมือที่แนะนำ (Recommended Tools)
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-3">
                        {selectedOption.developmentTools}
                      </p>
                   </div>

                   {/* Concrete Outputs (New Section) */}
                   <div>
                      <h4 className="text-sm font-bold text-fuchsia-400 uppercase mb-3 flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4" /> ผลลัพธ์และการแจ้งเตือน (Output & Alerts)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedOption.concreteOutputs.map((output, i) => (
                           <div key={i} className="flex items-start gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-fuchsia-500/20 hover:bg-slate-900 transition-colors">
                              <BellRing className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" />
                              <span className="text-slate-300 text-sm">{output}</span>
                           </div>
                        ))}
                      </div>
                   </div>

                   {/* Visualization Strategy */}
                   <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">
                        กลยุทธ์ภาพรวม (Strategy)
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {selectedOption.visualization}
                      </p>
                   </div>

                   {/* Tech Stack */}
                   <div className="pt-2 border-t border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {selectedOption.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] uppercase tracking-wider rounded-md border border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Chat Bot */}
          <div className="w-full">
            <ChatBot analysisResult={result} selectedOption={selectedOption} />
          </div>

        </div>
      )}
    </div>
  );
};
