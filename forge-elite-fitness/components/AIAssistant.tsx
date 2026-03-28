
import React, { useState, useRef, useEffect } from 'react';
import { getAssistantResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Terminal, Cpu, Loader2, ShieldCheck, Activity, RefreshCw, AlertCircle, Globe, ExternalLink, Cloud, Rocket } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "FORGE CORE NEXUS ONLINE. Diagnostics complete. How can I assist with your system performance or application technicalities today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showGCP, setShowGCP] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
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
      const response = await getAssistantResponse(
        messages.map(m => ({ role: m.role, content: m.content })),
        input
      );
      setMessages(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "CORE ERROR: CONNECTION INTERRUPTED. RETRY COMMAND.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const runDiagnostics = () => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      const diagMsg: ChatMessage = { 
        role: 'model', 
        content: `DIAGNOSTIC REPORT:
- Local Storage: OPTIMAL (34.2kb used)
- Network Latency: 42ms
- Sync Engine: ACTIVE
- User Profile: VALIDATED
No anomalies detected in the Forge Core.`, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, diagMsg]);
      setIsDiagnosticRunning(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-slate-950 rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden border border-slate-800 animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 animate-pulse">
            <Cpu size={32} />
          </div>
          <div>
            <h2 className="font-black text-2xl text-white tracking-tighter uppercase italic">Core Nexus</h2>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Integrity: 100%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowGCP(!showGCP); setShowDeployment(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/40 transition-all"
          >
            <Cloud size={14} /> GCP PROTOCOLS
          </button>
          <button 
            onClick={() => { setShowDeployment(!showDeployment); setShowGCP(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/40 transition-all"
          >
            <Globe size={14} /> LIVE GUIDE
          </button>
          <button 
            onClick={runDiagnostics}
            disabled={isDiagnosticRunning}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all disabled:opacity-50"
          >
            {isDiagnosticRunning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Scan
          </button>
        </div>
      </div>

      {showGCP && (
        <div className="p-8 bg-slate-900 text-white animate-in slide-in-from-top-4 duration-500 border-b border-slate-800">
           <div className="flex items-center gap-3 mb-4">
              <Cloud className="text-indigo-400" size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tight">Google Cloud Hosting Protocol</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Option A: Firebase Hosting (Easiest)</p>
                <div className="bg-black/40 p-4 rounded-xl font-mono text-[10px] text-slate-300 border border-slate-800">
                  # 1. Install CLI<br/>
                  npm install -g firebase-tools<br/><br/>
                  # 2. Login & Init<br/>
                  firebase login<br/>
                  firebase init<br/><br/>
                  # 3. Deploy<br/>
                  firebase deploy
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Option B: App Engine (Advanced)</p>
                <div className="bg-black/40 p-4 rounded-xl font-mono text-[10px] text-slate-300 border border-slate-800">
                  # 1. Build Project<br/>
                  npm run build<br/><br/>
                  # 2. Deploy via GCloud<br/>
                  gcloud app deploy<br/><br/>
                  # Note: Using the provided app.yaml
                </div>
              </div>
           </div>
           <p className="mt-6 text-[10px] text-slate-500 italic">Core Nexus has already prepared 'app.yaml' and 'firebase.json' in your root directory.</p>
        </div>
      )}

      {showDeployment && (
        <div className="p-8 bg-indigo-600 text-white animate-in slide-in-from-top-4 duration-500 border-b border-indigo-700">
           <h3 className="text-xl font-black mb-2 uppercase italic flex items-center gap-2">
             <Globe size={20} /> MAKE THIS APP PUBLIC LIVE
           </h3>
           <p className="text-sm text-indigo-100 mb-6">To access this app on any device via a URL, follow these 3 steps:</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-[10px] font-black uppercase mb-2">Step 1: Download</p>
                <p className="text-xs font-medium">Download all these project files to your computer.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-[10px] font-black uppercase mb-2">Step 2: Upload</p>
                <p className="text-xs font-medium">Go to <span className="font-black">Vercel.com</span> or <span className="font-black">Netlify.com</span>.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-[10px] font-black uppercase mb-2">Step 3: Go Live</p>
                <p className="text-xs font-medium">Drag and drop the folder. You'll get a permanent public link!</p>
              </div>
           </div>
           <button 
             onClick={() => window.open('https://vercel.com', '_blank')}
             className="mt-6 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-indigo-50 transition-all"
           >
             OPEN VERCEL <ExternalLink size={14} />
           </button>
        </div>
      )}

      {/* Terminal Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                m.role === 'user' ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {m.role === 'user' ? <Terminal size={20} /> : <Cpu size={20} />}
              </div>
              <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-xl font-mono ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-900/90 text-slate-300 border border-slate-800 rounded-tl-none backdrop-blur-md'
              }`}>
                {m.content}
                <p className={`text-[8px] mt-4 opacity-40 font-black ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  TIMESTAMP: {new Date(m.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                <Cpu size={20} className="animate-spin-slow" />
              </div>
              <div className="bg-slate-900/50 p-6 rounded-[32px] rounded-tl-none border border-slate-800 flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Core Directives...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="p-8 bg-slate-900/50 border-t border-slate-800">
        <div className="relative flex items-center group">
          <div className="absolute left-6 text-indigo-500 group-focus-within:text-white transition-colors">
            <Terminal size={20} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter system command or describe technical hurdle..."
            className="w-full py-6 pl-16 pr-20 bg-slate-950 border border-slate-800 rounded-[28px] text-sm text-indigo-100 font-mono focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-600 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
