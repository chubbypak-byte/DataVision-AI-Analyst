
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage, SolutionOption } from '../types';
import { streamChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatBotProps {
  selectedOption?: SolutionOption | null;
}

export const ChatBot: React.FC<ChatBotProps> = ({ selectedOption }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `สวัสดีครับ หากมีข้อสงสัยเกี่ยวกับ **${selectedOption ? selectedOption.title : 'ผลการวิเคราะห์'}** หรือต้องการให้ช่วยร่าง JD ในส่วนไหน สอบถามได้เลยครับ`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when selection changes
  useEffect(() => {
    if (selectedOption) {
        setMessages(prev => [
            ...prev, 
            {
                id: Date.now().toString(),
                role: 'model',
                text: `คุณเลือก **${selectedOption.title}** แล้ว มีประเด็นไหนเกี่ยวกับเทคโนโลยี ${selectedOption.technologies.join(', ')} ที่อยากทราบบ้างครับ?`,
                timestamp: new Date()
            }
        ]);
    }
  }, [selectedOption]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      // Pass selectedOption to service
      const stream = await streamChatResponse(history, userMsg.text, selectedOption || null);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, text: fullText } : m
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'ขออภัยครับ ระบบสื่อสารขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-[500px] font-prompt relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Assistant</h3>
            <p className="text-[10px] text-cyan-400">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30 scroll-smooth relative z-10">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border
              ${msg.role === 'user' 
                ? 'bg-slate-800 border-slate-700 text-slate-400' 
                : 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400'
              }
            `}>
              {msg.role === 'user' ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            </div>

            <div className={`max-w-[85%]`}>
               <div className={`
                p-3 rounded-xl text-xs leading-relaxed border backdrop-blur-sm shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-slate-800 text-white border-slate-700 rounded-tr-none' 
                  : 'bg-slate-900/80 text-slate-200 border-slate-800 rounded-tl-none'
                }
              `}>
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex items-center gap-2 text-xs text-slate-500 ml-10">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></span>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 relative z-10">
        <div className="relative flex items-end gap-2 bg-slate-950 border border-slate-700 rounded-xl p-1.5 focus-within:border-cyan-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง)"
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-xs text-slate-200 placeholder-slate-600 max-h-20 py-2 px-2 scrollbar-hide"
            rows={1}
            style={{ minHeight: '36px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
