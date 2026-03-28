
import React, { useState } from 'react';
import { generateEliteBeginnerPlan } from '../services/geminiService';
import { ElitePlan, Workout } from '../types';
import { 
  Sparkles, 
  Loader2, 
  Clock, 
  Timer, 
  Calendar, 
  ChevronRight, 
  Info,
  Dumbbell,
  CheckCircle2
} from 'lucide-react';

interface PlanMakerProps {
  onPlanAccepted: (workouts: Workout[]) => void;
}

const PlanMaker: React.FC<PlanMakerProps> = ({ onPlanAccepted }) => {
  const [loading, setLoading] = useState(false);
  const [lifestyle, setLifestyle] = useState('');
  const [goal, setGoal] = useState('Build Muscle');
  const [elitePlan, setElitePlan] = useState<ElitePlan | null>(null);

  const handleGenerate = async () => {
    if (!lifestyle.trim()) {
      alert("Please tell us a bit about your schedule!");
      return;
    }
    setLoading(true);
    try {
      const plan = await generateEliteBeginnerPlan(lifestyle, goal);
      setElitePlan(plan);
    } catch (e) {
      alert("Failed to create plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const acceptPlan = () => {
    if (elitePlan) {
      onPlanAccepted(elitePlan.workouts);
      alert("Plan added to your workout library!");
      setElitePlan(null);
      setLifestyle('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center">
        <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Make a Plan</h2>
        <p className="text-slate-500">Intelligent scheduling for beginners. We find the time; you bring the sweat.</p>
      </div>

      {!elitePlan ? (
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-violet-500" /> Your Lifestyle & Schedule
            </label>
            <textarea 
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              placeholder="Example: I work 9-5, commute for 45 mins. I'm usually tired in the evening but free on weekends..."
              className="w-full p-6 bg-slate-50 border-none rounded-[32px] text-base focus:ring-2 focus:ring-violet-500 h-32 resize-none shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Dumbbell size={16} className="text-violet-500" /> Primary Fitness Goal
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Build Muscle', 'Weight Loss', 'Better Health', 'Increase Stamina'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-4 px-6 rounded-2xl font-bold text-sm transition-all border-2 ${
                    goal === g 
                    ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-lg shadow-violet-50' 
                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-violet-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-violet-700 disabled:opacity-50 transition-all shadow-xl shadow-violet-100"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Analyzing Your Schedule...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Architect My Beginner Plan
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-6">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-violet-200 mb-6">Expert Recommendation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-violet-200 mb-1">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">When to go</span>
                  </div>
                  <p className="text-3xl font-black">{elitePlan.recommendedTimeOfDay}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-violet-200 mb-1">
                    <Timer size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Session Duration</span>
                  </div>
                  <p className="text-3xl font-black">{elitePlan.sessionDurationMinutes} <span className="text-lg font-medium opacity-70">mins</span></p>
                </div>
              </div>

              <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md">
                <div className="flex gap-3 items-start">
                  <Info size={20} className="text-violet-200 mt-1 shrink-0" />
                  <p className="text-sm leading-relaxed text-violet-50 italic">"{elitePlan.justification}"</p>
                </div>
              </div>
            </div>
            
            <Sparkles className="absolute -top-4 -right-4 text-white/10 w-48 h-48 pointer-events-none" />
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-black text-slate-800 px-2 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-violet-500" /> 
              Weekly Routine
            </h4>
            <div className="grid gap-4">
              {elitePlan.workouts.map((w, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-violet-600 flex items-center justify-center font-black text-xl shrink-0">
                    Day {i+1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-black text-slate-800 text-lg">{w.name}</h5>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {w.exercises.length} Exercises • {w.duration} Mins
                    </p>
                  </div>
                  <ChevronRight className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setElitePlan(null)}
              className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
            >
              Back to Start
            </button>
            <button 
              onClick={acceptPlan}
              className="flex-[2] py-4 px-6 bg-violet-600 text-white font-black rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-100"
            >
              Add Plan to Library
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanMaker;
