
import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Loader2, 
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
  Fingerprint,
  RefreshCcw,
  Zap,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'verify';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [securityStatus, setSecurityStatus] = useState<'IDLE' | 'HANDSHAKE' | 'ENCLAVE' | 'AUTHORIZED'>('IDLE');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    level: 'Intermediate',
    otp: ''
  });

  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    if (formData.password.length === 0) setPassStrength(0);
    else if (formData.password.length < 6) setPassStrength(1);
    else if (formData.password.length < 10) setPassStrength(2);
    else setPassStrength(3);
  }, [formData.password]);

  useEffect(() => {
    if (lockoutUntil) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutUntil) {
          setLockoutUntil(null);
          setFailedAttempts(0);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil) return;

    setError('');
    
    // Validations
    if (mode === 'signup') {
      if (!formData.name) return setError('NAME REQUIRED: Identification token missing.');
      if (!validateEmail(formData.email)) return setError('INVALID LINK: Email format unrecognized.');
      if (formData.password.length < 8) return setError('WEAK KEY: Password must be 8+ characters.');
    } else if (mode === 'login') {
      if (!formData.email) return setError('IDENTITY REQUIRED: Email/Phone missing.');
      if (!formData.password) return setError('KEY REQUIRED: Access password missing.');
    }

    setLoading(true);
    setSecurityStatus('HANDSHAKE');

    // High-fidelity UI delay for "Security Handshake"
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSecurityStatus('ENCLAVE');
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const users: User[] = JSON.parse(localStorage.getItem('forge_users') || '[]');

      if (mode === 'login') {
        const user = users.find(u => 
          (u.email.toLowerCase() === formData.email.toLowerCase() || u.phone === formData.email) && 
          u.password === formData.password
        );
        
        if (user) {
          setSecurityStatus('AUTHORIZED');
          await new Promise(resolve => setTimeout(resolve, 600));
          const { password, ...safeUser } = user;
          onLogin(safeUser as User);
        } else {
          handleFailure();
        }
      } else if (mode === 'signup') {
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
          setError('IDENTITY COLLISION: Email already registered in the Forge.');
          setSecurityStatus('IDLE');
        } else {
          const newUser: User = {
            id: Math.random().toString(36).substring(2, 11),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            level: formData.level
          };
          localStorage.setItem('forge_users', JSON.stringify([...users, newUser]));
          setSecurityStatus('AUTHORIZED');
          await new Promise(resolve => setTimeout(resolve, 600));
          const { password, ...safeUser } = newUser;
          onLogin(safeUser as User);
        }
      }
    } catch (err) {
      setError('ENCLAVE ERROR: Secure handshake timed out.');
      setSecurityStatus('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = () => {
    const newFailCount = failedAttempts + 1;
    setFailedAttempts(newFailCount);
    setSecurityStatus('IDLE');
    if (newFailCount >= 3) {
      setLockoutUntil(Date.now() + 60000);
      setError('LOCKDOWN: Excessive failures. Cooling down for 60s.');
    } else {
      setError(`INVALID CREDENTIALS: Entry ${newFailCount}/3 rejected.`);
    }
  };

  const getLockoutSeconds = () => lockoutUntil ? Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000)) : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,transparent_100%)] opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="w-full max-w-lg relative z-10 transition-all duration-700">
        <div className={`bg-white rounded-[48px] shadow-[0_48px_128px_-24px_rgba(0,0,0,0.8)] overflow-hidden border border-slate-100/10 flex flex-col transition-all duration-500 ${lockoutUntil ? 'grayscale opacity-80 blur-[1px]' : ''}`}>
          
          {/* Status Bar */}
          <div className="h-2 bg-slate-100 overflow-hidden">
            <div 
              className={`h-full bg-indigo-600 transition-all duration-1000 ease-out ${securityStatus === 'HANDSHAKE' ? 'w-1/3' : securityStatus === 'ENCLAVE' ? 'w-2/3' : securityStatus === 'AUTHORIZED' ? 'w-full' : 'w-0'}`} 
            />
          </div>

          <div className="p-8 pt-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`bg-slate-900 w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-transform duration-500 ${loading ? 'scale-90 rotate-45' : 'rotate-6'}`}>
                  <Flame size={40} className="text-white" />
                </div>
                {securityStatus === 'AUTHORIZED' && (
                  <div className="absolute -right-2 -bottom-2 bg-emerald-500 text-white p-2 rounded-xl border-4 border-white animate-in zoom-in">
                    <ShieldCheck size={20} />
                  </div>
                )}
                {loading && securityStatus !== 'AUTHORIZED' && (
                  <div className="absolute -right-2 -bottom-2 bg-indigo-600 text-white p-2 rounded-xl border-4 border-white animate-spin">
                    <RefreshCcw size={20} />
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-1">Forge Elite</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Accessing Core Enclave L-03</p>
            
            <div className="flex bg-slate-100 p-1.5 rounded-[24px] mb-8">
              <button 
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}
              >
                Identification
              </button>
              <button 
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}
              >
                System Registry
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {lockoutUntil ? (
                <div className="py-12 text-center animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                    <ShieldAlert size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Brute Force Detected</h3>
                  <p className="text-slate-500 text-sm mt-2">Security protocols active. Wait for system cooldown.</p>
                  <div className="mt-8 inline-block px-8 py-3 bg-slate-900 text-white rounded-2xl font-mono text-2xl font-bold">
                    00:{getLockoutSeconds().toString().padStart(2, '0')}
                  </div>
                </div>
              ) : (
                <>
                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Display Token</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                          type="text" required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Your full name"
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-slate-800 focus:bg-white focus:border-indigo-600/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Identity Channel</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input 
                        type="email" required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="Email address"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-slate-800 focus:bg-white focus:border-indigo-600/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between px-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Key</label>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                        {showPassword ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} required
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-bold text-slate-800 focus:bg-white focus:border-indigo-600/10 outline-none transition-all"
                      />
                    </div>
                    {mode === 'signup' && formData.password.length > 0 && (
                      <div className="flex gap-1.5 mt-2 px-1">
                        {[1,2,3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= passStrength ? (passStrength === 3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Capability Level</label>
                      <div className="relative group">
                        <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <select 
                          value={formData.level}
                          onChange={e => setFormData({...formData, level: e.target.value})}
                          className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] font-black text-slate-800 focus:bg-white focus:border-indigo-600/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Elite Pro</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-2xl border border-red-100 flex items-center gap-3 animate-in shake">
                      <ShieldAlert size={14} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-4 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 mt-6 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <RefreshCcw size={20} className="animate-spin" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span className="uppercase tracking-widest">{mode === 'login' ? 'Initiate Link' : 'Architect Profile'}</span>
                        <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          <div className="p-8 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Network Secured</span>
            </div>
            <div className="flex items-center gap-4">
              <Fingerprint size={16} className="text-slate-600" />
              <ShieldCheck size={16} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-in.shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Auth;
