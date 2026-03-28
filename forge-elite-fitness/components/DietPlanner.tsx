
import React, { useState } from 'react';
import { generateDietPlan } from '../services/geminiService';
import { DietPlan } from '../types';
import { Apple, Loader2, Weight, Ruler, Target, Clock, Utensils, Info } from 'lucide-react';

const DietPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(180);
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState<DietPlan | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      alert("Please provide a goal for your diet plan.");
      return;
    }
    setLoading(true);
    try {
      const data = await generateDietPlan(weight, height, goal);
      setPlan(data);
    } catch (e) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Apple size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">AI Diet Architect</h2>
        <p className="text-slate-500">Biometric-driven nutrition plans for elite results.</p>
      </div>

      {!plan ? (
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Weight size={14} /> Weight (kg)
              </label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Ruler size={14} /> Height (cm)
              </label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} /> Reason for Diet / Goal
            </label>
            <textarea 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Lose 5kg in a month, Build lean muscle for swimming, Maintain weight with high energy..."
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xl shadow-emerald-100"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Analyzing Biometrics...
              </>
            ) : (
              <>
                <Apple size={24} />
                Build My Plan
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-6">
          <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Target Daily Fuel</p>
                <h3 className="text-5xl font-black">{plan.dailyCalories} <span className="text-xl opacity-70">kcal</span></h3>
              </div>
              <button 
                onClick={() => setPlan(null)}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <MacroCard label="Protein" value={plan.macros.protein} />
              <MacroCard label="Carbs" value={plan.macros.carbs} />
              <MacroCard label="Fats" value={plan.macros.fats} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
                <Utensils size={20} className="text-emerald-500" /> Daily Menu
              </h4>
              {plan.meals.map((meal, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                      <Clock size={10} className="inline mr-1" /> {meal.time}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{meal.calories} kcal</span>
                  </div>
                  <h5 className="font-bold text-slate-800 mb-1">{meal.name}</h5>
                  <p className="text-sm text-slate-500 leading-relaxed">{meal.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
                <Info size={20} className="text-emerald-500" /> Nutritionist Tips
              </h4>
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                {plan.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <p className="text-slate-600 text-sm italic leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] text-amber-800 text-sm">
                <p className="font-bold mb-1">Disclaimer</p>
                This plan is generated by AI and should be reviewed by a professional nutritionist before starting.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MacroCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
    <p className="text-lg font-black">{value}</p>
  </div>
);

export default DietPlanner;
