
import React, { useState, useEffect } from 'react';
import { Workout, ProgressData } from '../types';
import { Flame, Clock, Award, ChevronRight, Droplets, Dumbbell, Zap, Timer, Loader2, Plus, Check, Calendar, ShieldCheck, Activity, Share2, Download, Upload, Copy } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { calculateBurnedCalories } from '../services/geminiService';

interface DashboardProps {
  workouts: Workout[];
  progress: ProgressData[];
  onUpdateProgress?: (newProgress: ProgressData[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, progress, onUpdateProgress }) => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [syncData, setSyncData] = useState('');
  const [exercise, setExercise] = useState('');
  const [logType, setLogType] = useState<'strength' | 'cardio'>('strength');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [duration, setDuration] = useState(30);
  const [selectedDay, setSelectedDay] = useState('');
  const [intensity, setIntensity] = useState('Medium');
  const [isCalculating, setIsCalculating] = useState(false);

  const totalCalories = progress.reduce((acc, curr) => acc + curr.calories, 0);
  const totalTime = progress.reduce((acc, curr) => acc + curr.duration, 0);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayAbbr = days[new Date().getDay()];

  useEffect(() => {
    const saved = localStorage.getItem('forge_water_today');
    if (saved) setWaterIntake(parseInt(saved));
    setSelectedDay(currentDayAbbr);
  }, [currentDayAbbr]);

  const handleExport = () => {
    const data = {
      workouts,
      progress,
      water: localStorage.getItem('forge_water_today'),
      user: localStorage.getItem('forge_current_user')
    };
    const encoded = btoa(JSON.stringify(data));
    setSyncData(encoded);
    navigator.clipboard.writeText(encoded);
    alert("DATA EXPORTED: Your Sync Key is copied. Paste this on your other device!");
  };

  const handleImport = () => {
    try {
      const decoded = JSON.parse(atob(syncData));
      if (confirm("IMPORT DATA: This will overwrite your current device data. Proceed?")) {
        localStorage.setItem('forge_workouts', JSON.stringify(decoded.workouts));
        localStorage.setItem('forge_progress', JSON.stringify(decoded.progress));
        localStorage.setItem('forge_water_today', decoded.water || '0');
        localStorage.setItem('forge_current_user', JSON.stringify(decoded.user));
        window.location.reload();
      }
    } catch (e) {
      alert("INVALID SYNC KEY: Please ensure you copied the full code.");
    }
  };

  const handleLogActivity = async () => {
    if (!exercise.trim()) return;
    setIsCalculating(true);
    
    try {
      const calculatedDuration = logType === 'cardio' ? duration : (sets * 2);
      const result = await calculateBurnedCalories(
        exercise,
        calculatedDuration,
        75,
        intensity,
        logType === 'strength' ? sets : 0,
        logType === 'strength' ? reps : 0
      );

      if (onUpdateProgress) {
        const newProgress = progress.map(p => {
          if (p.day === selectedDay) {
            return {
              ...p,
              calories: p.calories + result.calories,
              duration: p.duration + calculatedDuration
            };
          }
          return p;
        });
        onUpdateProgress(newProgress);
        setIsLogging(false);
        setExercise('');
        alert(`Logged ${result.calories} calories burned for ${selectedDay}!`);
      }
    } catch (e) {
      alert("Failed to calculate calories. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control Center</h2>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 ml-2">
                <Activity size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">LIVE SYSTEM PULSE</span>
             </div>
          </div>
          <p className="text-slate-500 font-medium">Monitoring peak output for {new Date().toLocaleDateString(undefined, { weekday: 'long' })}.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSync(!showSync)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
            title="Cloud Port Sync"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsLogging(!isLogging)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            {isLogging ? <Check size={18} /> : <Plus size={18} />}
            {isLogging ? "CLOSE LOGGER" : "LOG PERFORMANCE"}
          </button>
        </div>
      </section>

      {showSync && (
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500 rounded-xl"><Share2 size={20} /></div>
             <div>
                <h3 className="text-xl font-black uppercase italic">Cloud Port Sync</h3>
                <p className="text-xs text-slate-400">Transfer your data between devices securely.</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
               <button 
                 onClick={handleExport}
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
               >
                 <Download size={16} /> GENERATE SYNC KEY
               </button>
               <p className="text-[10px] text-slate-400 italic">Click to copy your data. Paste it on your phone or tablet to sync.</p>
            </div>
            <div className="space-y-4">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Paste Sync Key here..." 
                    value={syncData}
                    onChange={(e) => setSyncData(e.target.value)}
                    className="w-full p-4 bg-slate-800 border-none rounded-2xl text-xs font-mono text-indigo-300 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <button 
                 onClick={handleImport}
                 className="w-full py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
               >
                 <Upload size={16} /> IMPORT FROM KEY
               </button>
            </div>
          </div>
        </div>
      )}

      {isLogging && (
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border-2 border-indigo-50 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic">Activity Architect</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => setLogType('strength')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${logType === 'strength' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
                >
                  STRENGTH
                </button>
                <button 
                  onClick={() => setLogType('cardio')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${logType === 'cardio' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
                >
                  CARDIO
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exercise / Movement</label>
                <input 
                  type="text" 
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="Bench Press, HIIT, Cycling..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                  <Calendar size={12} /> Log for which day?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {days.map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${selectedDay === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {logType === 'strength' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sets</label>
                    <input 
                      type="number" min="1" max="20" 
                      value={sets} onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-center focus:ring-2 focus:ring-indigo-500 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reps / Times</label>
                    <input 
                      type="number" min="1" max="100" 
                      value={reps} onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-center focus:ring-2 focus:ring-indigo-500 shadow-inner"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Duration (mins)</label>
                  <input 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-center focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Intensity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map(i => (
                    <button 
                      key={i}
                      onClick={() => setIntensity(i)}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${intensity === i ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      {i.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 mb-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Estimated Volume</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-700">
                    {logType === 'strength' ? sets * reps : duration}
                  </span>
                  <span className="text-xs font-bold text-indigo-400">
                    {logType === 'strength' ? 'REPS' : 'MINS'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogActivity}
                disabled={isCalculating || !exercise}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    TRANSMITTING...
                  </>
                ) : (
                  <>
                    <Flame size={24} />
                    UPDATE PROFILE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Flame className="text-orange-500" />} 
          label="Metabolic Burn" 
          value={totalCalories.toLocaleString()} 
          unit="kcal" 
          bg="bg-orange-50" 
        />
        <StatCard 
          icon={<Clock className="text-blue-500" />} 
          label="Active Time" 
          value={Math.floor(totalTime / 60)} 
          unit={`h ${totalTime % 60}m`} 
          bg="bg-blue-50" 
        />
        <StatCard 
          icon={<Droplets className="text-cyan-500" />} 
          label="Hydration" 
          value={waterIntake} 
          unit="ml / 3000" 
          bg="bg-cyan-50" 
        />
        <StatCard 
          icon={<Award className="text-purple-500" />} 
          label="Sessions" 
          value={workouts.length} 
          unit="logs" 
          bg="bg-purple-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="font-black text-slate-800 tracking-tight text-xl uppercase italic">Performance Curve</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Metabolic Activity Profile</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 900}} dy={10} />
                <Tooltip 
                  cursor={{fill: 'rgba(79, 70, 229, 0.05)', radius: 12}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px'}}
                />
                <Bar dataKey="calories" radius={[12, 12, 12, 12]} barSize={40}>
                  {progress.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.day === currentDayAbbr ? '#4f46e5' : '#f1f5f9'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 tracking-tight text-xl uppercase italic">Recent Logs</h3>
            <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors uppercase tracking-widest">
              Full History <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-5">
            {workouts.length > 0 ? workouts.slice(0, 4).map((w) => (
              <div key={w.id} className="flex items-center gap-4 p-5 rounded-[32px] hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Dumbbell size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 truncate tracking-tight text-lg">{w.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Timer size={12} /> {w.duration}m <span className="text-slate-200">|</span> <Flame size={12} className="text-orange-400" /> {w.calories}kcal
                  </p>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">{w.date || 'Today'}</span>
              </div>
            )) : (
              <div className="text-center py-16 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
                <Dumbbell className="mx-auto text-slate-200 mb-4" size={40} />
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Awaiting Logs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, bg }: any) => (
  <div className={`p-8 rounded-[40px] ${bg} flex flex-col gap-5 border-2 border-white shadow-xl hover:scale-[1.02] transition-all duration-300 group`}>
    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{unit}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
