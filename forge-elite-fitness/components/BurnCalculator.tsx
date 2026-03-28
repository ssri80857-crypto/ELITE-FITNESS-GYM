
import React, { useState } from 'react';
import { calculateBurnedCalories } from '../services/geminiService';
import { ProgressData } from '../types';
import { Flame, Loader2, Timer, Weight, Activity, Zap, ClipboardCheck, Hash, Layers, CheckCircle } from 'lucide-react';

interface BurnCalculatorProps {
  progress?: ProgressData[];
  onUpdateProgress?: (newProgress: ProgressData[]) => void;
}

const BurnCalculator: React.FC<BurnCalculatorProps> = ({ progress, onUpdateProgress }) => {
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [weight, setWeight] = useState<number>(75);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(12);
  const [intensity, setIntensity] = useState('Medium');
  const [result, setResult] = useState<{ calories: number; breakdown: string } | null>(null);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayAbbr = days[new Date().getDay()];

  const handleCalculate = async () => {
    if (!exercise.trim()) {
      alert("Please enter the exercise name.");
      return;
    }
    setLoading(true);
    try {
      const data = await calculateBurnedCalories(exercise, duration, weight, intensity, sets, reps);
      setResult(data);
    } catch (e) {
      alert("Failed to calculate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToProgress = () => {
    if (!result || !progress || !onUpdateProgress) return;
    
    setIsSyncing(true);
    setTimeout(() => {
      const newProgress = progress.map(p => {
        if (p.day === currentDayAbbr) {
          return {
            ...p,
            calories: p.calories + result.calories,
            duration: p.duration + duration
          };
        }
        return p;
      });
      onUpdateProgress(newProgress);
      setIsSyncing(false);
      alert(`Successfully synced ${result.calories} kcal to your progress for ${currentDayAbbr}!`);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Flame size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Burn Calculator</h2>
        <p className="text-slate-500">Calculate exact calories burned with sets and frequency precision.</p>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Zap size={14} className="text-orange-500" /> What did you do?
            </label>
            <input 
              type="text" 
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="e.g. Bench Press, Squats, Boxing..."
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-orange-500 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Timer size={14} className="text-orange-500" /> Total Duration (mins)
              </label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-orange-500 shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Weight size={14} className="text-orange-500" /> Body Weight (kg)
              </label>
              <input 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-orange-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Layers size={14} className="text-orange-500" /> How many sets?
              </label>
              <input 
                type="number" 
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-orange-500 shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Hash size={14} className="text-orange-500" /> Times / Reps per set
              </label>
              <input 
                type="number" 
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-orange-500 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Activity size={14} className="text-orange-500" /> Intensity Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Low', 'Medium', 'High'].map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
                    intensity === i 
                    ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-sm' 
                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-5 bg-orange-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-orange-700 disabled:opacity-50 transition-all shadow-xl shadow-orange-100"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Calculating Energy Output...
            </>
          ) : (
            <>
              <Flame size={24} />
              Calculate Burn
            </>
          )}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-orange-50 rounded-[32px] border border-orange-100 animate-in slide-in-from-top-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Burn</p>
                <h3 className="text-4xl font-black text-orange-700">{result.calories} <span className="text-lg opacity-70">kcal</span></h3>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-600">
                <ClipboardCheck size={24} />
              </div>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl border border-orange-200/50">
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{result.breakdown}"
              </p>
            </div>
            
            <button
              onClick={handleSyncToProgress}
              disabled={isSyncing}
              className="w-full py-4 bg-white border-2 border-orange-200 text-orange-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              SYNC TO TODAY'S PROGRESS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BurnCalculator;
