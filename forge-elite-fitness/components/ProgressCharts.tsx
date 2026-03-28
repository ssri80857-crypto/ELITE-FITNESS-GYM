
import React from 'react';
import { ProgressData } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { Activity, Zap, TrendingUp, Target, Flame, Timer, Award } from 'lucide-react';

interface ProgressChartsProps {
  progress: ProgressData[];
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ progress }) => {
  const totalCalories = progress.reduce((acc, curr) => acc + curr.calories, 0);
  const totalDuration = progress.reduce((acc, curr) => acc + curr.duration, 0);
  const avgCalories = progress.length ? Math.round(totalCalories / progress.length) : 0;
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayAbbr = days[new Date().getDay()];
  const todayProgress = progress.find(p => p.day === currentDayAbbr) || { calories: 0, duration: 0 };

  const WEEKLY_GOAL_KCAL = 3500;
  const goalPercentage = Math.min(Math.round((totalCalories / WEEKLY_GOAL_KCAL) * 100), 100);

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Performance Intel</h2>
          <p className="text-slate-500 font-medium">Real-time data synchronization from your logs and calculations.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Weekly View</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Weekly Energy Flow</p>
            <h3 className="text-5xl font-black mb-6">{totalCalories.toLocaleString()} <span className="text-lg font-medium opacity-60">kcal</span></h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-100">
                <span>Goal Progress</span>
                <span>{goalPercentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>
          </div>
          <Flame className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <Target size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Today's Peak</p>
                <p className="text-2xl font-black text-slate-800">{todayProgress.calories} kcal</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
              "Your performance today contributes {Math.round((todayProgress.calories / avgCalories || 1) * 100)}% to your weekly average."
            </p>
          </div>
          <div className="pt-6 border-t border-slate-50 mt-4">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase">Avg Daily Burn</span>
               <span className="text-sm font-black text-slate-800">{avgCalories} kcal</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                <Timer size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Active</p>
                <p className="text-2xl font-black text-slate-800">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
              "Consistency is the forge of progress. You've logged {progress.filter(p => p.calories > 0).length} active days this week."
            </p>
          </div>
          <div className="pt-6 border-t border-slate-50 mt-4">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase">Weekly Rank</span>
               <span className="text-sm font-black text-indigo-600">ELITE LEVEL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-800 tracking-tight">Metabolic Trajectory</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Calories Logged & Calculated</p>
              </div>
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 900}} 
                  dy={15} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 10}} />
                <Tooltip 
                  cursor={{stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '24px'}}
                  itemStyle={{fontWeight: 900, fontSize: '16px', color: '#4f46e5'}}
                  labelStyle={{fontWeight: 900, color: '#1e293b', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#4f46e5" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorCal)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">Active Intensity</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Minutes per day</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1', fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}
                  />
                  <Line 
                    type="step" 
                    dataKey="duration" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{r: 8, fill: '#10b981', strokeWidth: 4, stroke: '#fff'}} 
                    activeDot={{r: 10, strokeWidth: 0}}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award size={160} />
            </div>
            <div className="relative z-10">
              <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                <TrendingUp size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black mb-3">Evolution Tracked.</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Your performance data is seamlessly integrated. Every calculation and manual log strengthens your analytical profile.
              </p>
            </div>
            <div className="mt-10 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Global Elite Ranking: #1,245</p>
              </div>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all">
                DOWNLOAD ANALYTICS PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;
