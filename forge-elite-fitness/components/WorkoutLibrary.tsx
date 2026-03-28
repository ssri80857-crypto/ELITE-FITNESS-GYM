
import React, { useState, useMemo } from 'react';
import { Workout, Exercise } from '../types';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Timer, 
  Flame as Fire, 
  Search, 
  Dumbbell, 
  Calendar,
  X,
  CheckCircle2,
  Filter,
  ArrowRight
} from 'lucide-react';

interface WorkoutLibraryProps {
  workouts: Workout[];
  onUpdate: (workouts: Workout[]) => void;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ workouts, onUpdate }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Workout State
  const [newWorkout, setNewWorkout] = useState<Partial<Workout>>({
    name: '',
    duration: 45,
    calories: 300,
    exercises: []
  });

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
  }, [workouts, searchQuery]);

  const removeWorkout = (id: string) => {
    if (confirm('Permanently delete this workout log?')) {
      onUpdate(workouts.filter(w => w.id !== id));
    }
  };

  const handleManualAdd = () => {
    if (!newWorkout.name) return;
    const workout: Workout = {
      id: Math.random().toString(36).substr(2, 9),
      name: newWorkout.name || 'Custom Session',
      duration: newWorkout.duration || 0,
      calories: newWorkout.calories || 0,
      exercises: newWorkout.exercises || [],
      date: new Date().toISOString().split('T')[0]
    };
    onUpdate([workout, ...workouts]);
    setShowAddModal(false);
    setNewWorkout({ name: '', duration: 45, calories: 300, exercises: [] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Elite Logbook</h2>
          <p className="text-slate-500 font-medium">Precision tracking for peak performance.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          MANUAL ENTRY
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search logs by name or muscle group..."
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[28px] text-slate-800 placeholder:text-slate-400 font-medium focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
        />
        <div className="absolute inset-y-0 right-5 flex items-center">
          <Filter size={18} className="text-slate-300" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Logs" value={workouts.length} icon={<Calendar className="text-indigo-600" size={16} />} />
        <SummaryCard label="Avg Duration" value={workouts.length ? Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / workouts.length) + 'm' : '0m'} icon={<Timer className="text-emerald-600" size={16} />} />
        <SummaryCard label="Total Burn" value={workouts.reduce((acc, w) => acc + w.calories, 0).toLocaleString()} icon={<Fire className="text-orange-600" size={16} />} />
        <SummaryCard label="Strength" value={workouts.reduce((acc, w) => acc + w.exercises.length, 0)} icon={<Dumbbell className="text-blue-600" size={16} />} />
      </div>

      {/* Logs List */}
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Plus size={40} />
          </div>
          <h3 className="font-black text-2xl text-slate-800">Your logbook is empty</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium italic">"The only workout you regret is the one that didn't happen."</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              className={`group bg-white border-2 transition-all duration-300 overflow-hidden ${
                expandedId === workout.id 
                ? 'rounded-[40px] border-indigo-600 shadow-2xl scale-[1.02]' 
                : 'rounded-[32px] border-slate-50 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div 
                className="p-6 flex items-center gap-6 cursor-pointer"
                onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
              >
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                  expandedId === workout.id ? 'bg-indigo-600 text-white rotate-12' : 'bg-slate-50 text-slate-400'
                }`}>
                   <Fire size={28} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-xl text-slate-800 truncate tracking-tight">{workout.name}</h3>
                    {expandedId !== workout.id && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <Timer size={14} className="text-indigo-400" /> {workout.duration}m
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <Fire size={14} className="text-orange-400" /> {workout.calories}kcal
                    </span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                      {workout.exercises.length} Exercises
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end mr-4">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Session Date</span>
                  <span className="text-sm font-bold text-slate-600">{workout.date || 'Today'}</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWorkout(workout.id);
                  }}
                  className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <div className={`text-slate-300 transition-transform duration-300 ${expandedId === workout.id ? 'rotate-180' : ''}`}>
                   <ChevronDown size={24} />
                </div>
              </div>

              {expandedId === workout.id && (
                <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-slate-100">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Exercise Breakdown</h4>
                      <div className="space-y-4">
                        {workout.exercises.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group/item">
                            <div>
                              <p className="font-black text-slate-800">{ex.name}</p>
                              {ex.notes && <p className="text-[10px] text-slate-400 mt-0.5 font-bold italic">{ex.notes}</p>}
                            </div>
                            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 opacity-80 group-hover/item:opacity-100 transition-opacity">
                              {ex.sets} × {ex.reps}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Post-Session Analysis</h4>
                      <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100">
                        <div className="flex items-center gap-3 mb-4 text-indigo-700">
                          <CheckCircle2 size={20} />
                          <span className="font-black text-sm uppercase tracking-wider">Metabolic Impact High</span>
                        </div>
                        <p className="text-slate-600 text-sm italic leading-relaxed">
                          This session focused on high-intensity volume. You maintained an average burn of {Math.round(workout.calories / workout.duration)} kcal/min. Continue progressive overload in the next session to maximize hypertrophy.
                        </p>
                        <button className="w-full mt-6 py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                          REPEAT SESSION <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Manual Log Entry</h3>
                <p className="text-indigo-100 text-sm font-medium">Capture your grind with precision.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Session Name</label>
                <input 
                  type="text" 
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                  placeholder="e.g. Heavy Pull Day, Evening Cardio..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Duration (min)</label>
                  <input 
                    type="number" 
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Est. Burn (kcal)</label>
                  <input 
                    type="number" 
                    value={newWorkout.calories}
                    onChange={(e) => setNewWorkout({...newWorkout, calories: parseInt(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs italic">
                Note: Manual entries are added to today's date and will appear at the top of your logbook.
              </div>

              <button 
                onClick={handleManualAdd}
                disabled={!newWorkout.name}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                COMMIT LOG ENTRY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, icon }: any) => (
  <div className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
      <p className="text-lg font-black text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

export default WorkoutLibrary;
