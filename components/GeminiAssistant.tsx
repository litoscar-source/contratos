import React, { useState, useRef, useEffect } from 'react';
import { generateAssistantResponse } from '../services/geminiService';
import { Client } from '../types';
import { Bot, Send, Loader2, Sparkles, X } from 'lucide-react';

interface GeminiAssistantProps {
  clients: Client[];
  isOpen: boolean;
  onToggle: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ clients, isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Olá! Sou o assistente de manutenção. Como posso ajudar com os contratos ou equipamentos hoje?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const response = await generateAssistantResponse(userMsg, { clients, currentView: 'Sidebar' });
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-300 hover:scale-105 transition-transform z-40 flex items-center gap-2"
      >
        <Sparkles className="w-6 h-6" />
        <span className="font-semibold hidden md:inline">IA Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden z-40 animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-sm">Assistente Inteligente</h3>
            <p className="text-[10px] opacity-80">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={onToggle} className="hover:bg-white/20 p-1 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre contratos, visitas..."
            className="w-full pl-4 pr-10 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;