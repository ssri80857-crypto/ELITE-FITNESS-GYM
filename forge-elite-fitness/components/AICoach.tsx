
import React, { useState, useRef, useEffect } from 'react';
import { getCoachResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm Forge Coach. Ready to smash some goals today? Ask me anything about form, nutrition, or your routine.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getCoachResponse(
        messages.map(m => ({ role: m.role, content: m.content })),
        input
      );
      setMessages(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I lost focus for a moment. Can you repeat that?", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="p-6 bg-indigo-600 text-white flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <Bot size={28} />
        </div>
        <div>
          <h2 className="font-bold text-xl">Forge Coach</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-indigo-100">Live & Ready</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-800 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Thinking</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 pt-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about workout form, diet, or tips..."
            className="w-full py-4 pl-6 pr-16 bg-slate-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
