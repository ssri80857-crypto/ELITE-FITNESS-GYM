
import React, { useState } from 'react';
import { generateWorkoutPlan } from '../services/geminiService';
import { Workout } from '../types';
import { Sparkles, Loader2, Target, Zap, Calendar, ClipboardList } from 'lucide-react';

interface AIPlannerProps {
  onPlanGenerated: (workouts: Workout[]) => void;
}

const AIPlanner: React.FC<AIPlannerProps> = ({ onPlanGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [goal, setGoal] = useState('Build Muscle');
  const [level, setLevel] = useState('Intermediate');
  const [days, setDays] = useState(3);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateWorkoutPlan(goal, level, days, requirements);
      onPlanGenerated(plan);
      alert('AI plan generated and added to your library!');
    } catch (e) {
      console.error(e);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-700">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Forge AI Planner</h2>
        <p className="text-slate-500 mt-2">Personalized training architecture powered by Gemini Intelligence.</p>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl space-y-8">
        {/* Requirement Section - First as requested */}
        <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
          <label className="flex items-center gap-2 text-sm font-black text-indigo-600 mb-3 uppercase tracking-wider">
            <ClipboardList size={18} /> Plan Requirements
          </label>
          <textarea 
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Specify any equipment (e.g., 'home dumbbells only'), injuries, or focus areas (e.g., 'focus on leg strength')..."
            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 h-28 resize-none shadow-sm"
          />
          <p className="text-[10px] text-slate-400 mt-2 italic font-medium">These requirements will guide the AI in exercise selection.</p>
        </div>

        {/* Options Section - Next as requested */}
        <div className="space-y-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              <Target size={16} /> Fitness Goal
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Build Muscle', 'Lose Weight', 'Endurance', 'Flexibility'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                    goal === g 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              <Zap size={16} /> Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                    level === l 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              <Calendar size={16} /> Frequency (Days/Week)
            </label>
            <input 
              type="range" 
              min="1" 
              max="7" 
              value={days} 
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>1 DAY</span>
              <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{days} DAYS</span>
              <span>7 DAYS</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Architecting Your Plan...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Forge My Routine
            </>
          )}
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400 font-medium">
        Our AI analyzes thousands of exercise combinations to build the most efficient plan for your bio-data.
      </p>
    </div>
  );
};

export default AIPlanner;
