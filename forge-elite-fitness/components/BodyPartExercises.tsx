
import React, { useState } from 'react';
import { getExercisesByBodyPart } from '../services/geminiService';
import { Exercise } from '../types';
import { Search, Loader2, Dumbbell, Info, Star, Zap } from 'lucide-react';

const BODY_PARTS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Glutes'];
const SPECIAL_GUIDES = [
  { id: 'Six Pack', label: 'Build a Six Pack', icon: <Star size={16} /> },
  { id: 'Weight Loss', label: 'Lose Weight', icon: <Zap size={16} /> }
];

const BodyPartExercises: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExercises = async (part: string) => {
    setSelectedPart(part);
    setLoading(true);
    try {
      const data = await getExercisesByBodyPart(part);
      setExercises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Elite Exercise Guide</h2>
          <p className="text-slate-500">Expert-curated protocols and body-part specific training.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">Specialized Goals</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIAL_GUIDES.map(guide => (
              <button
                key={guide.id}
                onClick={() => fetchExercises(guide.id)}
                disabled={loading}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-sm transition-all border-2 ${
                  selectedPart === guide.id 
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'border-white bg-white text-indigo-600 hover:border-indigo-100 shadow-sm'
                } disabled:opacity-50`}
              >
                {guide.icon}
                {guide.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Target Muscles</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BODY_PARTS.map(part => (
              <button
                key={part}
                onClick={() => fetchExercises(part)}
                disabled={loading}
                className={`py-4 px-2 rounded-2xl font-bold text-sm transition-all border-2 ${
                  selectedPart === part 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                  : 'border-white bg-white text-slate-600 hover:border-slate-100 shadow-sm'
                } disabled:opacity-50`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-medium">Architecting your {selectedPart} protocol...</p>
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid gap-4 animate-in slide-in-from-bottom-4">
          {exercises.map((ex, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Dumbbell size={20} />
                  </div>
                  <h3 className="font-black text-xl text-slate-800">{ex.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended</div>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-xs font-bold">{ex.sets} Sets × {ex.reps}</div>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-2xl mt-4 border border-slate-100/50">
                <Info size={16} className="text-indigo-400 mt-1 shrink-0" />
                <p className="text-slate-600 text-sm italic">{ex.notes}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <p className="text-slate-400 font-medium">Select a guide to unlock peak performance data</p>
        </div>
      )}
    </div>
  );
};

export default BodyPartExercises;
