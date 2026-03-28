
import React, { useState, useEffect } from 'react';
import { View, Workout, ProgressData, User as UserType } from './types';
import Dashboard from './components/Dashboard';
import WorkoutLibrary from './components/WorkoutLibrary';
import AIPlanner from './components/AIPlanner';
import AICoach from './components/AICoach';
import ProgressCharts from './components/ProgressCharts';
import WaterTracker from './components/WaterTracker';
import BodyPartExercises from './components/BodyPartExercises';
import DietPlanner from './components/DietPlanner';
import PlanMaker from './components/PlanMaker';
import BurnCalculator from './components/BurnCalculator';
import Store from './components/Store';
import Auth from './components/Auth';
import Feed from './components/Feed';
import AIAssistant from './components/AIAssistant';
import LandingPage from './components/LandingPage';
import InstallBanner from './components/InstallBanner';
import { 
  LayoutDashboard, 
  Dumbbell, 
  BrainCircuit, 
  MessageSquare, 
  LineChart, 
  Flame,
  User,
  Droplets,
  BookOpen,
  Apple,
  CalendarDays,
  Flame as FireIcon,
  ShoppingBag,
  LogOut,
  Users,
  ShieldAlert,
  LucideIcon,
  ShieldCheck,
  Key,
  Lock,
  Zap,
  Fingerprint
} from 'lucide-react';

const INITIAL_PROGRESS: ProgressData[] = [
  { day: 'Mon', calories: 0, duration: 0 },
  { day: 'Tue', calories: 0, duration: 0 },
  { day: 'Wed', calories: 0, duration: 0 },
  { day: 'Thu', calories: 0, duration: 0 },
  { day: 'Fri', calories: 0, duration: 0 },
  { day: 'Sat', calories: 0, duration: 0 },
  { day: 'Sun', calories: 0, duration: 0 },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>(INITIAL_PROGRESS);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [ownerKey, setOwnerKey] = useState('');
  const [isBooting, setIsBooting] = useState(false);
  const [sessionPulse, setSessionPulse] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('forge_current_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedWorkouts = localStorage.getItem('forge_workouts');
    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));

    const savedProgress = localStorage.getItem('forge_progress');
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    
    const ownerStatus = sessionStorage.getItem('forge_is_owner');
    if (ownerStatus === 'true') setIsOwner(true);

    setIsLoaded(true);
    
    // Simulate periodic session integrity check
    const pulseInterval = setInterval(() => {
      setSessionPulse(prev => !prev);
    }, 5000);
    return () => clearInterval(pulseInterval);
  }, []);

  const handleLogin = (newUser: UserType) => {
    setIsBooting(true);
    setTimeout(() => {
      setUser(newUser);
      localStorage.setItem('forge_current_user', JSON.stringify(newUser));
      setShowAuth(false);
      setIsBooting(false);
    }, 2000);
  };

  const handleLogout = () => {
    if (confirm("Terminate secure session and purge local tokens?")) {
      setUser(null);
      setIsOwner(false);
      sessionStorage.removeItem('forge_is_owner');
      localStorage.removeItem('forge_current_user');
      setCurrentView(View.DASHBOARD);
    }
  };

  const verifyOwner = () => {
    if (ownerKey === 'srihari1234') {
      setIsOwner(true);
      sessionStorage.setItem('forge_is_owner', 'true');
      setShowOwnerLogin(false);
      setOwnerKey('');
      alert("MASTER ACCESS GRANTED: Global Owner Mode Activated.");
    } else {
      alert("SECURITY ALERT: Invalid Master Key. Access Denied.");
      setOwnerKey('');
    }
  };

  const saveWorkouts = (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    localStorage.setItem('forge_workouts', JSON.stringify(newWorkouts));
  };

  const updateProgress = (newProgress: ProgressData[]) => {
    setProgress(newProgress);
    localStorage.setItem('forge_progress', JSON.stringify(newProgress));
  };

  if (!isLoaded) return null;

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[1000] p-10">
        <div className="w-32 h-32 bg-indigo-600 rounded-[40px] flex items-center justify-center animate-pulse mb-8 relative">
           <Zap size={48} className="text-white" />
           <div className="absolute inset-0 border-4 border-indigo-400 rounded-[40px] animate-ping opacity-20" />
        </div>
        <div className="space-y-4 text-center max-w-xs">
          <h2 className="text-white font-black text-2xl uppercase tracking-[0.2em] italic">Architecting...</h2>
          <div className="h-1 bg-slate-900 w-full rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite] origin-left" />
          </div>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Establishing secure neural link to enclave...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowAuth(false)}
            className="fixed top-8 left-8 z-[60] px-6 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
          >
            <LogOut size={14} className="rotate-180" /> Public Portal
          </button>
          <Auth onLogin={handleLogin} />
        </div>
      );
    }
    return (
      <LandingPage 
        onGetStarted={() => setShowAuth(true)} 
        onLogin={() => setShowAuth(true)}
      />
    );
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: LucideIcon, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 ${
        currentView === view 
        ? 'text-indigo-600 scale-110' 
        : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-2 rounded-xl transition-colors ${currentView === view ? 'bg-indigo-50' : ''}`}>
        <Icon size={18} strokeWidth={currentView === view ? 2.5 : 2} />
      </div>
      <span className="text-[8px] font-black mt-1 uppercase tracking-tighter text-center">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <InstallBanner />
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Flame size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-tight uppercase italic">Forge Elite</h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full transition-opacity duration-1000 ${sessionPulse ? 'bg-emerald-500' : 'bg-emerald-500/30'}`} />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Secure</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1.5 flex-1 overflow-y-auto pr-2 scrollbar-hide">
          <SidebarLink active={currentView === View.DASHBOARD} onClick={() => setCurrentView(View.DASHBOARD)} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <SidebarLink active={currentView === View.ASSISTANT} onClick={() => setCurrentView(View.ASSISTANT)} icon={<ShieldAlert size={18}/>} label="System Nexus" />
          <SidebarLink active={currentView === View.FEED} onClick={() => setCurrentView(View.FEED)} icon={<Users size={18}/>} label="Community Feed" />
          <SidebarLink active={currentView === View.STORE} onClick={() => setCurrentView(View.STORE)} icon={<ShoppingBag size={18}/>} label="Forge Store" />
          <div className="h-px bg-slate-100 my-4" />
          <SidebarLink active={currentView === View.CALORIES} onClick={() => setCurrentView(View.CALORIES)} icon={<FireIcon size={18}/>} label="Burn Calc" />
          <SidebarLink active={currentView === View.MAKE_PLAN} onClick={() => setCurrentView(View.MAKE_PLAN)} icon={<CalendarDays size={18}/>} label="Make a Plan" />
          <SidebarLink active={currentView === View.WATER} onClick={() => setCurrentView(View.WATER)} icon={<Droplets size={18}/>} label="Hydration" />
          <SidebarLink active={currentView === View.DIET} onClick={() => setCurrentView(View.DIET)} icon={<Apple size={18}/>} label="Diet Architect" />
          <div className="h-px bg-slate-100 my-4" />
          <SidebarLink active={currentView === View.WORKOUTS} onClick={() => setCurrentView(View.WORKOUTS)} icon={<Dumbbell size={18}/>} label="Workout Log" />
          <SidebarLink active={currentView === View.EXERCISES} onClick={() => setCurrentView(View.EXERCISES)} icon={<BookOpen size={18}/>} label="Exercise Guide" />
          <SidebarLink active={currentView === View.PLANNER} onClick={() => setCurrentView(View.PLANNER)} icon={<BrainCircuit size={18}/>} label="AI Planner" />
          <SidebarLink active={currentView === View.COACH} onClick={() => setCurrentView(View.COACH)} icon={<MessageSquare size={18}/>} label="Forge Coach" />
          <SidebarLink active={currentView === View.PROGRESS} onClick={() => setCurrentView(View.PROGRESS)} icon={<LineChart size={18}/>} label="Progress" />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          {isOwner && (
            <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Master Access</span>
            </div>
          )}
          
          <div className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between group">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={() => !isOwner && setShowOwnerLogin(true)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isOwner ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 shadow-sm'}`}
              >
                {isOwner ? <Fingerprint size={24} /> : <User size={24} />}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800 truncate tracking-tight">{user.name}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isOwner ? 'Global Owner' : user.level}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-5 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <Flame size={18} />
             </div>
             <h1 className="font-black text-lg tracking-tighter uppercase italic">Forge Elite</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${sessionPulse ? 'bg-emerald-500' : 'bg-emerald-500/20'}`} />
            {isOwner && <Fingerprint size={18} className="text-indigo-600" />}
            <button onClick={handleLogout} className="text-slate-400">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-4 md:p-12">
          {currentView === View.DASHBOARD && <Dashboard workouts={workouts} progress={progress} onUpdateProgress={updateProgress} />}
          {currentView === View.ASSISTANT && <AIAssistant />}
          {currentView === View.FEED && <Feed user={user} />}
          {currentView === View.STORE && <Store />}
          {currentView === View.CALORIES && <BurnCalculator progress={progress} onUpdateProgress={updateProgress} />}
          {currentView === View.MAKE_PLAN && <PlanMaker onPlanAccepted={(newWorkouts) => saveWorkouts([...workouts, ...newWorkouts])} />}
          {currentView === View.WATER && <WaterTracker />}
          {currentView === View.DIET && <DietPlanner />}
          {currentView === View.WORKOUTS && <WorkoutLibrary workouts={workouts} onUpdate={saveWorkouts} />}
          {currentView === View.EXERCISES && <BodyPartExercises />}
          {currentView === View.PLANNER && <AIPlanner onPlanGenerated={(newWorkouts) => saveWorkouts([...workouts, ...newWorkouts])} />}
          {currentView === View.COACH && <AICoach />}
          {currentView === View.PROGRESS && <ProgressCharts progress={progress} />}
        </div>
      </main>

      {/* Owner Access Modal - Hardened UI */}
      {showOwnerLogin && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl p-12 animate-in zoom-in-95 duration-500 relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
             <div className="text-center mb-10">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Lock size={36} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Enclave Master</h3>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Global System Authority Required</p>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Master Access Code</label>
                   <input 
                     type="password" 
                     value={ownerKey}
                     onChange={(e) => setOwnerKey(e.target.value)}
                     placeholder="••••••••••••"
                     className="w-full p-5 bg-slate-50 border-none rounded-3xl text-center text-xl font-black tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                     autoFocus
                     onKeyPress={(e) => e.key === 'Enter' && verifyOwner()}
                   />
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => { setShowOwnerLogin(false); setOwnerKey(''); }} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">ABORT</button>
                  <button onClick={verifyOwner} className="flex-2 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-xs uppercase tracking-widest">AUTHENTICATE</button>
                </div>
             </div>
             
             <div className="mt-8 flex justify-center gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-100" />)}
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center z-40 h-22 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] overflow-x-auto whitespace-nowrap scrollbar-hide">
        <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Home" />
        <NavItem view={View.ASSISTANT} icon={ShieldAlert} label="Nexus" />
        <NavItem view={View.FEED} icon={Users} label="Feed" />
        <NavItem view={View.STORE} icon={ShoppingBag} label="Store" />
        <NavItem view={View.CALORIES} icon={FireIcon} label="Burn" />
        <NavItem view={View.MAKE_PLAN} icon={CalendarDays} label="Plan" />
        <NavItem view={View.WATER} icon={Droplets} label="Water" />
        <NavItem view={View.DIET} icon={Apple} label="Diet" />
        <NavItem view={View.WORKOUTS} icon={Dumbbell} label="Logs" />
        <NavItem view={View.EXERCISES} icon={BookOpen} label="Guide" />
        <NavItem view={View.COACH} icon={MessageSquare} label="Coach" />
      </nav>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

interface SidebarLinkProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink = ({ active, onClick, icon, label }: SidebarLinkProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-tighter transition-all ${
      active 
      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
    {label}
  </button>
);

export default App;
