
import React from 'react';
import { 
  Flame, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BrainCircuit, 
  Target, 
  Trophy, 
  ChevronRight,
  Github,
  Twitter,
  Instagram
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Flame size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">
              Forge<br /><span className="text-indigo-500">Elite</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Features</a>
            <a href="#nexus" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">AI Nexus</a>
            <a href="#store" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Store</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-6 py-2.5 text-sm font-black text-slate-300 hover:text-white transition-all uppercase tracking-widest"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-900/20 uppercase tracking-widest"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">New: Gemini 3.0 Pro Integration</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            THE FORGE OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-500 bg-300% animate-gradient">
              ELITE ATHLETES
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Engineered for the top 1%. A comprehensive fitness ecosystem driven by autonomous AI Intelligence to architect your peak physical evolution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-900/40 hover:-translate-y-1 active:scale-95"
            >
              Join the Elite <ArrowRight size={24} />
            </button>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-black">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">+12k Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 text-center">System Capabilities</p>
            <h3 className="text-4xl md:text-5xl font-black text-center tracking-tight">INTELLIGENT ARCHITECTURE</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit size={32} />}
              title="AI Workout Architect"
              description="Gemini-driven routines that adapt in real-time to your physiological feedback and goal progression."
            />
            <FeatureCard 
              icon={<Target size={32} />}
              title="Precision Nutrition"
              description="Biometric diet planning that optimizes your metabolic engine for maximum hypertrophy or weight loss."
            />
            <FeatureCard 
              icon={<Zap size={32} />}
              title="Metabolic Intel"
              description="High-fidelity calorie calculation factorizing intensity, volume, and rest periods for total accuracy."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="nexus" className="py-24 px-6 border-y border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/30">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-4xl font-black mb-6 tracking-tight">SECURE. AUTONOMOUS. <br />INFALLIBLE.</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Forge Elite isn't just an app; it's a decentralized performance hub. Your data is encrypted, your progress is immutable, and our System Nexus AI ensures your technical experience is seamless.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                <Trophy className="text-amber-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-300">Ranked #1 AI Health Platform 2024</p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                <ShieldCheck className="text-emerald-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-300">Military-Grade Data Encryption</p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-[50px] p-10 overflow-hidden">
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-800 animate-pulse" />
                   <div className="space-y-2 flex-1">
                     <div className="h-4 w-3/4 bg-slate-800 rounded-full animate-pulse" />
                     <div className="h-3 w-1/2 bg-slate-800 rounded-full animate-pulse" />
                   </div>
                 </div>
                 <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800">
                    <p className="text-indigo-400 font-mono text-xs mb-4">CORE_NEXUS_LOG:</p>
                    <p className="text-slate-300 font-mono text-sm leading-relaxed">
                      [INFO] Metabolic analysis complete. <br />
                      [INFO] User fatigue levels: LOW. <br />
                      [INFO] Optimizing hypertrophy protocols... <br />
                      [SUCCESS] New routine transmitted.
                    </p>
                 </div>
                 <div className="flex justify-center gap-2">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-500/30" />)}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <Flame size={20} />
                </div>
                <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">
                  Forge<br /><span className="text-indigo-500">Elite</span>
                </h1>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                The terminal for physical dominance. Built for those who demand the absolute best from their machines.
              </p>
              <div className="flex gap-4">
                <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                  <Twitter size={20} />
                </button>
                <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                  <Instagram size={20} />
                </button>
                <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                  <Github size={20} />
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">System</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-bold">
                <li><a href="#" className="hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gemini API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Performance Logs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-bold">
                <li><a href="#" className="hover:text-white transition-colors">Elite Program</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Store Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Newsletter</h4>
              <p className="text-slate-500 text-sm mb-4 font-medium">Join the intelligence briefing.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="comm_link@email.com"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-indigo-600 outline-none flex-1"
                />
                <button className="p-2 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">© 2024 Forge Elite Systems. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[40px] hover:border-indigo-600/50 hover:bg-indigo-900/5 transition-all group">
    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 border border-slate-800 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <h4 className="text-2xl font-black mb-4 tracking-tight">{title}</h4>
    <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
    <div className="mt-8">
       <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-white transition-colors">
         Explore Capability <ChevronRight size={14} />
       </button>
    </div>
  </div>
);

export default LandingPage;
