/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  History, 
  LayoutDashboard, 
  Library, 
  MessageSquare, 
  Settings,
  Plus,
  Play,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Flame,
  Timer,
  Apple,
  Info,
  Search,
  Zap,
  Droplets,
  Bell,
  BellOff,
  Volume2,
  TrendingUp,
  BarChart2,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Activity,
  BookOpen,
  Save,
  Settings as SettingsIcon,
  Users,
  Send,
  Trash2,
  ShoppingBag,
  Lock,
  Edit2,
  ShoppingCart,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import Markdown from 'react-markdown';
import { format } from 'date-fns';

import { WorkoutSession, WorkoutExercise, Exercise, Set, WaterTracking, WaterLog, DailyActivity, DailyProgress, SavedItem, Product, Order } from './types';
import { EXERCISE_LIBRARY } from './constants';
import { getFitnessAdvice, generateDietPlan, getExerciseDetails, calculateCaloriesBurned, getCalorieEstimate } from './services/gemini';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('forge_logged_in') === 'true';
  });
  const [user, setUser] = useState<{ name: string, email: string }>(() => {
    const saved = localStorage.getItem('forge_user');
    return saved ? JSON.parse(saved) : { name: 'Alex', email: 'alex@example.com' };
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'landing'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'history' | 'library' | 'ai' | 'diet' | 'guide' | 'water' | 'calories' | 'progress' | 'settings' | 'saved' | 'store' | 'admin'>('dashboard');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestTimeRemaining, setGuestTimeRemaining] = useState(() => {
    const today = new Date().toDateString();
    const lastUsedDate = localStorage.getItem('forge_guest_date');
    const timeUsed = parseInt(localStorage.getItem('forge_guest_time') || '0');
    
    if (lastUsedDate !== today) {
      return 120; // 2 minutes in seconds
    }
    return Math.max(0, 120 - timeUsed);
  });
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I'm your FORGE ELITE FITNESS AI trainer. How can I help you today? I can suggest workouts, check your form, or help with nutrition." }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Water Tracking State
  const [waterData, setWaterData] = useState<WaterTracking>(() => {
    const saved = localStorage.getItem('forge_water');
    if (saved) return JSON.parse(saved);
    return {
      currentIntake: 0,
      goal: 2500,
      logs: [],
      lastResetDate: new Date().toDateString(),
      reminderEnabled: false,
      reminderInterval: 60
    };
  });
  const [showWaterAlert, setShowWaterAlert] = useState(false);

  // Persistence
  useEffect(() => {
    if (!isGuestMode) {
      localStorage.setItem('forge_water', JSON.stringify(waterData));
    }
  }, [waterData, isGuestMode]);

  // 24-hour Reset Logic
  useEffect(() => {
    const today = new Date().toDateString();
    if (waterData.lastResetDate !== today) {
      setWaterData(prev => ({
        ...prev,
        currentIntake: 0,
        logs: [],
        lastResetDate: today
      }));
    }
  }, [waterData.lastResetDate]);

  // Reminder Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (waterData.reminderEnabled) {
      interval = setInterval(() => {
        setShowWaterAlert(true);
        // Play sound if possible
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {}); // Ignore if blocked
        } catch (e) {}
      }, waterData.reminderInterval * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [waterData.reminderEnabled, waterData.reminderInterval]);

  // Diet Plan State
  const [dietGoal, setDietGoal] = useState('Weight Loss');
  const [dietaryType, setDietaryType] = useState('Veg');
  const [otherDietaryDetails, setOtherDietaryDetails] = useState('');
  const [dietDetails, setDietDetails] = useState('');
  const [generatedDiet, setGeneratedDiet] = useState<string | null>(null);
  const [isDietLoading, setIsDietLoading] = useState(false);

  // Calorie Burn State
  const [burnExercise, setBurnExercise] = useState('');
  const [burnDuration, setBurnDuration] = useState(30);
  const [burnIntensity, setBurnIntensity] = useState('Moderate');
  const [burnWeight, setBurnWeight] = useState(75);
  const [burnResult, setBurnResult] = useState<string | null>(null);
  const [isBurnLoading, setIsBurnLoading] = useState(false);

  // Store State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('forge_products');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Premium Whey Protein', price: 59.99, image: 'https://picsum.photos/seed/protein/400/400', description: 'High-quality whey protein for muscle recovery.', category: 'Supplements' },
      { id: '2', name: 'Adjustable Dumbbells', price: 199.99, image: 'https://picsum.photos/seed/dumbbells/400/400', description: 'Space-saving adjustable dumbbells for home workouts.', category: 'Equipment' },
      { id: '3', name: 'Resistance Bands Set', price: 29.99, image: 'https://picsum.photos/seed/bands/400/400', description: 'Versatile bands for strength and mobility.', category: 'Equipment' },
      { id: '4', name: 'Pre-Workout Energy', price: 34.99, image: 'https://picsum.photos/seed/preworkout/400/400', description: 'Explosive energy and focus for your training.', category: 'Supplements' },
    ];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('forge_orders');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Persistence for Store
  useEffect(() => {
    localStorage.setItem('forge_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('forge_orders', JSON.stringify(orders));
  }, [orders]);

  // Daily Progress State
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>(() => {
    const saved = localStorage.getItem('forge_progress');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);

  // Saved Items State
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('forge_saved');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Feedback State
  const [feedback, setFeedback] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Persistence for Saved Items
  useEffect(() => {
    if (!isGuestMode) {
      localStorage.setItem('forge_saved', JSON.stringify(savedItems));
    }
  }, [savedItems, isGuestMode]);

  // Persistence
  useEffect(() => {
    if (!isGuestMode) {
      localStorage.setItem('forge_progress', JSON.stringify(dailyProgress));
    }
  }, [dailyProgress, isGuestMode]);

  // Guest Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGuestMode && guestTimeRemaining > 0) {
      timer = setInterval(() => {
        setGuestTimeRemaining(prev => {
          const next = prev - 1;
          const today = new Date().toDateString();
          const timeUsed = 120 - next;
          localStorage.setItem('forge_guest_time', timeUsed.toString());
          localStorage.setItem('forge_guest_date', today);
          return next;
        });
      }, 1000);
    } else if (isGuestMode && guestTimeRemaining <= 0) {
      handleLogout();
      alert("Guest session expired. You've used your 2-minute daily limit.");
    }
    return () => clearInterval(timer);
  }, [isGuestMode, guestTimeRemaining]);

  const handleLogActivity = async (exercise: string, duration: number, intensity: string) => {
    setIsLoggingActivity(true);
    const calories = await getCalorieEstimate(exercise, duration, intensity, burnWeight);
    const today = new Date().toDateString();
    
    setDailyProgress(prev => {
      const existingDay = prev.find(p => p.date === today);
      const newActivity: DailyActivity = {
        id: Math.random().toString(36).substr(2, 9),
        exercise,
        duration,
        intensity,
        caloriesBurned: calories,
        timestamp: new Date().toISOString()
      };

      if (existingDay) {
        return prev.map(p => p.date === today ? {
          ...p,
          totalCalories: p.totalCalories + calories,
          activities: [newActivity, ...p.activities]
        } : p);
      } else {
        return [{
          date: today,
          totalCalories: calories,
          activities: [newActivity]
        }, ...prev];
      }
    });
    setIsLoggingActivity(false);
  };
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [customExerciseSearch, setCustomExerciseSearch] = useState('');
  const [customExerciseResult, setCustomExerciseResult] = useState<string | null>(null);
  const [isCustomExerciseLoading, setIsCustomExerciseLoading] = useState(false);

  const bodyParts = [
    { id: 'Chest', label: 'Chest', icon: '💪' },
    { id: 'Back', label: 'Back', icon: '👐' },
    { id: 'Legs', label: 'Legs', icon: '🦵' },
    { id: 'Shoulders', label: 'Shoulders', icon: '🏋️' },
    { id: 'Arms', label: 'Arms', icon: '💪' },
    { id: 'Abs', label: 'Six Pack', icon: '🍫' },
    { id: 'Weight Loss', label: 'Weight Loss', icon: '🏃' },
    { id: 'Other', label: 'Other', icon: '🔍' },
  ];

  const handleCustomExerciseSearch = async () => {
    if (!customExerciseSearch.trim()) return;
    setIsCustomExerciseLoading(true);
    const result = await getExerciseDetails(customExerciseSearch);
    setCustomExerciseResult(result || "No details found.");
    setIsCustomExerciseLoading(false);
  };

  const filteredGuideExercises = selectedBodyPart 
    ? EXERCISE_LIBRARY.filter(ex => 
        ex.targetMuscle === selectedBodyPart || 
        ex.goal === selectedBodyPart ||
        (selectedBodyPart === 'Abs' && ex.goal === 'Six Pack') ||
        (selectedBodyPart === 'Weight Loss' && ex.goal === 'Weight Loss')
      )
    : [];

  const handleGenerateDiet = async () => {
    setIsDietLoading(true);
    const dietaryPref = dietaryType === 'Other' ? `Dietary Preference: ${otherDietaryDetails}` : `Dietary Preference: ${dietaryType}`;
    const details = `Goal: ${dietGoal}. ${dietaryPref}. Additional info: ${dietDetails}`;
    const plan = await generateDietPlan(details);
    setGeneratedDiet(plan || "Failed to generate plan.");
    setIsDietLoading(false);

    if (plan) {
      const newItem: SavedItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'diet',
        title: `Diet Plan: ${dietGoal} (${dietaryType})`,
        content: plan,
        timestamp: new Date().toISOString()
      };
      setSavedItems(prev => [newItem, ...prev]);
    }
  };

  const handleLogin = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    localStorage.setItem('forge_logged_in', 'true');
    localStorage.setItem('forge_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    // Reset session data for guest mode
    if (isGuestMode) {
      setWaterData({
        currentIntake: 0,
        goal: 2500,
        logs: [],
        lastResetDate: new Date().toDateString(),
        reminderEnabled: false,
        reminderInterval: 60
      });
      setSavedItems([]);
      setDailyProgress([]);
    }
    setIsLoggedIn(false);
    setIsGuestMode(false);
    localStorage.removeItem('forge_logged_in');
    localStorage.removeItem('forge_user');
    setAuthMode('landing');
  };

  const handleGuestLogin = () => {
    const today = new Date().toDateString();
    const lastUsedDate = localStorage.getItem('forge_guest_date');
    const timeUsed = parseInt(localStorage.getItem('forge_guest_time') || '0');
    
    if (lastUsedDate === today && timeUsed >= 120) {
      alert("You've used your 2-minute guest limit for today. Please sign up for unlimited access!");
      return;
    }

    const guestUser = { name: 'Guest', email: 'guest@forgeelitefitness.com' };
    setUser(guestUser);
    setIsGuestMode(true);
    setIsLoggedIn(true);
    // Reset session data for guest mode
    setWaterData({
      currentIntake: 0,
      goal: 2500,
      logs: [],
      lastResetDate: new Date().toDateString(),
      reminderEnabled: false,
      reminderInterval: 60
    });
    setSavedItems([]);
    setDailyProgress([]);
    setAuthMode('landing');
  };

  const handleSwitchAccounts = () => {
    // For this demo, we just log out and show landing
    handleLogout();
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSendingFeedback(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newItem: SavedItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'search', // Using search type for feedback logs
      title: `Feedback Sent`,
      content: feedback,
      timestamp: new Date().toISOString()
    };
    setSavedItems(prev => [newItem, ...prev]);
    
    setIsSendingFeedback(false);
    setFeedbackSuccess(true);
    setFeedback('');
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  const deleteSavedItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCalculateBurn = async () => {
    if (!burnExercise.trim()) return;
    setIsBurnLoading(true);
    const result = await calculateCaloriesBurned(burnExercise, burnDuration, burnIntensity, burnWeight);
    setBurnResult(result || "Failed to calculate.");
    setIsBurnLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-black font-sans selection:bg-emerald-100">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Dumbbell size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">FORGE ELITE FITNESS</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGuestLogin}
              className="text-sm font-bold text-black/40 hover:text-black transition-colors"
            >
              Guest
            </button>
            <button 
              onClick={() => setAuthMode('login')}
              className="text-sm font-bold hover:text-emerald-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black/80 transition-all active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-bold">
                <ShieldCheck size={16} className="text-emerald-400" />
                The Elite Standard in Performance
              </div>
              <h1 className="text-7xl font-bold leading-[1.1] tracking-tight">
                Forge your path to <span className="text-emerald-500">Elite Status.</span>
              </h1>
              <p className="text-xl text-black/60 leading-relaxed max-w-lg">
                FORGE ELITE FITNESS is a high-performance ecosystem engineered to track, analyze, and optimize your physical evolution. Built for those who demand excellence.
              </p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleGuestLogin}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-black/80 transition-all group"
                >
                  Try as Guest
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-black/5 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    +2k
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full" />
              <div className="relative bg-white p-4 rounded-[2.5rem] border border-black/5 shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/fitness/800/600" 
                  alt="App Preview" 
                  className="rounded-[2rem] w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <section className="mt-32 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Engineered for Excellence.</h2>
              <p className="text-black/40 max-w-2xl mx-auto">Harness the elite tools built into FORGE to accelerate your evolution and surpass your limits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<LayoutDashboard className="text-black" />}
                title="Elite Dashboard"
                description="Your mission control. Monitor vital metrics, strength trends, and upcoming sessions with surgical precision."
              />
              <FeatureCard 
                icon={<Dumbbell className="text-black" />}
                title="Strength Tracker"
                description="Professional-grade session logging. Track volume, intensity, and rest with zero friction."
              />
              <FeatureCard 
                icon={<MessageSquare className="text-black" />}
                title="Forge AI Trainer"
                description="Elite coaching powered by Gemini. Instant form analysis, strategic programming, and nutritional optimization."
              />
              <FeatureCard 
                icon={<Apple className="text-black" />}
                title="Nutritional Strategy"
                description="Precision-engineered meal plans tailored to your metabolic profile and performance objectives."
              />
              <FeatureCard 
                icon={<Droplets className="text-black" />}
                title="Hydration Matrix"
                description="Optimize your cellular performance with intelligent hydration tracking and strategic reminders."
              />
              <FeatureCard 
                icon={<TrendingUp className="text-black" />}
                title="Evolution Analytics"
                description="Visualize your transformation with advanced data modeling of your strength and body composition."
              />
            </div>
          </section>
        </main>

        {/* Auth Modals */}
        <AnimatePresence>
          {(authMode === 'login' || authMode === 'signup') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative"
              >
                <button 
                  onClick={() => setAuthMode('landing')}
                  className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>

                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-bold">
                      {authMode === 'login' ? 'Welcome Back' : 'Join FORGE ELITE FITNESS'}
                    </h3>
                    <p className="text-black/40">
                      {authMode === 'login' ? 'Enter your details to continue your journey.' : 'Start your 14-day free trial today.'}
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={(e) => { 
                    e.preventDefault(); 
                    const formData = new FormData(e.target as HTMLFormElement);
                    const name = (formData.get('name') as string) || 'User';
                    const email = formData.get('email') as string;
                    handleLogin(name, email); 
                  }}>
                    {authMode === 'signup' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          name="name"
                          type="text" 
                          required
                          placeholder="John Doe"
                          className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        name="email"
                        type="email" 
                        required
                        placeholder="name@example.com"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all active:scale-95 mt-4"
                    >
                      {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-black/5"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-white px-2 text-black/20 font-bold tracking-widest">Or</span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={handleGuestLogin}
                      className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-bold hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Users size={18} />
                      Continue as Guest
                    </button>
                  </form>

                  <div className="text-center">
                    <button 
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-sm font-bold text-black/40 hover:text-black transition-colors"
                    >
                      {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="border-t border-black/5 py-12 px-8 text-center text-black/40 text-sm">
          <p>© 2026 FORGE ELITE FITNESS. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // Mock data for charts
  const progressData = [
    { date: 'Mon', weight: 185, calories: 2400 },
    { date: 'Tue', weight: 184.5, calories: 2200 },
    { date: 'Wed', weight: 184.8, calories: 2500 },
    { date: 'Thu', weight: 184.2, calories: 2100 },
    { date: 'Fri', weight: 183.9, calories: 2300 },
    { date: 'Sat', weight: 183.5, calories: 2800 },
    { date: 'Sun', weight: 183.2, calories: 2000 },
  ];

  const startNewWorkout = () => {
    const newSession: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      name: `Workout ${format(new Date(), 'MMM d')}`,
      exercises: []
    };
    setCurrentSession(newSession);
    setActiveTab('workout');
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!currentSession) return;
    const newWorkoutExercise: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: exercise.id,
      name: exercise.name,
      sets: [{ id: '1', reps: 0, weight: 0, completed: false }]
    };
    setCurrentSession({
      ...currentSession,
      exercises: [...currentSession.exercises, newWorkoutExercise]
    });
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<Set>) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        };
      }
      return ex;
    });
    setCurrentSession({ ...currentSession, exercises: updatedExercises });
  };

  const addSet = (exerciseId: string) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, { id: Math.random().toString(36).substr(2, 9), reps: 0, weight: 0, completed: false }]
        };
      }
      return ex;
    });
    setCurrentSession({ ...currentSession, exercises: updatedExercises });
  };

  const finishWorkout = () => {
    if (!currentSession) return;
    setSessions([currentSession, ...sessions]);
    setCurrentSession(null);
    setActiveTab('history');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setInputMessage('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAILoading(true);
    
    const response = await getFitnessAdvice(userMsg);
    setAiMessages(prev => [...prev, { role: 'ai', content: response || "I'm sorry, I couldn't process that." }]);
    setIsAILoading(false);

    if (response) {
      const newItem: SavedItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'ai_chat',
        title: `AI Chat: ${userMsg.slice(0, 30)}...`,
        content: `User: ${userMsg}\n\nAI: ${response}`,
        timestamp: new Date().toISOString()
      };
      setSavedItems(prev => [newItem, ...prev]);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') { // Simple password for demo
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setActiveTab('admin');
    } else {
      alert('Incorrect password');
    }
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      productId: checkoutProduct!.id,
      productName: checkoutProduct!.name,
      price: checkoutProduct!.price,
      customerName: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setOrders(prev => [order, ...prev]);
    setCheckoutProduct(null);
    alert('Order placed successfully!');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedProduct: Product = {
      ...editingProduct!,
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string,
      description: formData.get('description') as string,
    };
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <nav className="w-20 md:w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Dumbbell className="text-white w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">FORGE ELITE FITNESS</span>
        </div>

        {isGuestMode && (
          <div className="px-6 py-4 bg-emerald-50 border-y border-emerald-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Guest Session</span>
              <span className="text-[10px] font-bold text-emerald-600">
                {Math.floor(guestTimeRemaining / 60)}:{(guestTimeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full h-1 bg-emerald-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: '100%' }}
                animate={{ width: `${(guestTimeRemaining / 120) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Play size={20} />} 
            label="Workout" 
            active={activeTab === 'workout'} 
            onClick={() => setActiveTab('workout')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem 
            icon={<Library size={20} />} 
            label="Exercises" 
            active={activeTab === 'library'} 
            onClick={() => setActiveTab('library')} 
          />
          <NavItem 
            icon={<Info size={20} />} 
            label="Exercise Guide" 
            active={activeTab === 'guide'} 
            onClick={() => setActiveTab('guide')} 
          />
          <NavItem 
            icon={<Apple size={20} />} 
            label="Diet Plan" 
            active={activeTab === 'diet'} 
            onClick={() => setActiveTab('diet')} 
          />
          <NavItem 
            icon={<Droplets size={20} />} 
            label="Water Tracker" 
            active={activeTab === 'water'} 
            onClick={() => setActiveTab('water')} 
          />
          <NavItem 
            icon={<Flame size={20} />} 
            label="Calorie Burn" 
            active={activeTab === 'calories'} 
            onClick={() => setActiveTab('calories')} 
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Progress" 
            active={activeTab === 'progress'} 
            onClick={() => setActiveTab('progress')} 
          />
          <NavItem 
            icon={<ShoppingBag size={20} />} 
            label="Store" 
            active={activeTab === 'store'} 
            onClick={() => setActiveTab('store')} 
          />
          <NavItem 
            icon={<ShieldCheck size={20} />} 
            label="Admin Panel" 
            active={activeTab === 'admin'} 
            onClick={() => {
              if (isAdminMode) {
                setActiveTab('admin');
              } else {
                setShowAdminLogin(true);
              }
            }} 
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="AI Assistance" 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
          />
          <NavItem 
            icon={<Save size={20} />} 
            label="Saved Files" 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')} 
          />
          <NavItem 
            icon={<SettingsIcon size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>

        <div className="p-4 border-t border-black/5 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-black/40 hover:text-red-500 transition-colors font-bold"
          >
            <LogIn size={20} className="rotate-180" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Water Alert Overlay */}
        <AnimatePresence>
          {showWaterAlert && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Droplets className="animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold">Time to Hydrate!</h4>
                <p className="text-sm text-white/80">Stay on top of your water goal.</p>
              </div>
              <button 
                onClick={() => setShowWaterAlert(false)}
                className="ml-4 bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
              >
                <CheckCircle2 size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user.name}</h1>
                  <p className="text-black/50 mt-1">You've hit your goals 5 days in a row!</p>
                </div>
                <button 
                  onClick={startNewWorkout}
                  className="bg-black text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-black/80 transition-colors shadow-lg shadow-black/10"
                >
                  <Plus size={20} />
                  Start Workout
                </button>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Daily Streak" 
                  value="12 Days" 
                  icon={<Flame className="text-orange-500" />} 
                  trend="+2 from last week"
                />
                <StatCard 
                  title="Workouts" 
                  value="24" 
                  icon={<Trophy className="text-yellow-500" />} 
                  trend="This month"
                />
                <StatCard 
                  title="Active Time" 
                  value="18.5h" 
                  icon={<Timer className="text-blue-500" />} 
                  trend="Last 30 days"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="font-semibold mb-6 flex items-center justify-between">
                    Weight Progress
                    <span className="text-xs text-black/40 font-normal">Last 7 days</span>
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressData}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="weight" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="font-semibold mb-6 flex items-center justify-between">
                    Calorie Intake
                    <span className="text-xs text-black/40 font-normal">Daily average: 2,350</span>
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'workout' && (
            <motion.div 
              key="workout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-4xl mx-auto"
            >
              {!currentSession ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                    <Play size={32} className="text-black/20 ml-1" />
                  </div>
                  <h2 className="text-2xl font-bold">No active workout</h2>
                  <p className="text-black/40 mt-2 mb-8">Ready to crush some goals today?</p>
                  <button 
                    onClick={startNewWorkout}
                    className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
                  >
                    Start New Session
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold">{currentSession.name}</h2>
                      <p className="text-black/40">{format(new Date(currentSession.date), 'EEEE, MMMM do')}</p>
                    </div>
                    <button 
                      onClick={finishWorkout}
                      className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors"
                    >
                      <CheckCircle2 size={20} />
                      Finish Workout
                    </button>
                  </header>

                  <div className="space-y-6">
                    {currentSession.exercises.map((ex) => (
                      <div key={ex.id} className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">{ex.name}</h3>
                          <button className="text-black/40 hover:text-black">
                            <Plus size={20} onClick={() => addSet(ex.id)} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-2 text-xs font-bold text-black/30 uppercase tracking-widest px-4">
                          <span>Set</span>
                          <span>Weight (kg)</span>
                          <span>Reps</span>
                          <span className="text-right">Status</span>
                        </div>

                        <div className="space-y-2">
                          {ex.sets.map((set, idx) => (
                            <div 
                              key={set.id} 
                              className={cn(
                                "grid grid-cols-4 gap-4 items-center p-3 rounded-xl transition-colors",
                                set.completed ? "bg-emerald-50" : "bg-black/5"
                              )}
                            >
                              <span className="font-bold text-black/40 px-1">{idx + 1}</span>
                              <input 
                                type="number" 
                                value={set.weight || ''} 
                                onChange={(e) => updateSet(ex.id, set.id, { weight: Number(e.target.value) })}
                                className="bg-transparent border-none focus:ring-0 font-mono text-lg w-full"
                                placeholder="0"
                              />
                              <input 
                                type="number" 
                                value={set.reps || ''} 
                                onChange={(e) => updateSet(ex.id, set.id, { reps: Number(e.target.value) })}
                                className="bg-transparent border-none focus:ring-0 font-mono text-lg w-full"
                                placeholder="0"
                              />
                              <div className="flex justify-end">
                                <button 
                                  onClick={() => updateSet(ex.id, set.id, { completed: !set.completed })}
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                    set.completed ? "bg-emerald-500 text-white" : "bg-white text-black/10 border border-black/10"
                                  )}
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => setActiveTab('library')}
                      className="w-full py-6 border-2 border-dashed border-black/10 rounded-3xl text-black/30 font-bold hover:border-black/20 hover:text-black/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={24} />
                      Add Exercise
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-4xl mx-auto space-y-6"
            >
              <h2 className="text-3xl font-bold mb-8">Workout History</h2>
              {sessions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
                  <p className="text-black/40">No workouts logged yet. Start your first session!</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer">
                    <div>
                      <h3 className="font-bold text-lg">{session.name}</h3>
                      <p className="text-black/40 text-sm">{format(new Date(session.date), 'MMM d, yyyy • h:mm a')}</p>
                      <div className="flex gap-2 mt-2">
                        {session.exercises.slice(0, 3).map(ex => (
                          <span key={ex.id} className="text-[10px] bg-black/5 px-2 py-1 rounded-full font-bold uppercase tracking-wider text-black/50">
                            {ex.name}
                          </span>
                        ))}
                        {session.exercises.length > 3 && (
                          <span className="text-[10px] bg-black/5 px-2 py-1 rounded-full font-bold text-black/50">
                            +{session.exercises.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-black/20" />
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div 
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-6xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Exercise Library</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search exercises..." 
                    className="bg-white border border-black/5 rounded-2xl px-6 py-3 w-64 focus:ring-2 focus:ring-black/5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EXERCISE_LIBRARY.map(exercise => (
                  <div key={exercise.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                          {exercise.targetMuscle}
                        </span>
                        <h3 className="text-xl font-bold mt-2">{exercise.name}</h3>
                        {exercise.recommendedSets && (
                          <p className="text-xs font-bold text-emerald-600 mt-1">{exercise.recommendedSets}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (!currentSession) startNewWorkout();
                          addExerciseToWorkout(exercise);
                          setActiveTab('workout');
                        }}
                        className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <p className="text-sm text-black/50 line-clamp-2">
                      {exercise.instructions?.join(' ')}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-black/30 font-medium">
                      <Dumbbell size={14} />
                      {exercise.equipment || 'Bodyweight'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'diet' && (
            <motion.div 
              key="diet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold">AI Diet Planner</h2>
                <p className="text-black/40">Get a personalized nutrition plan tailored to your goals.</p>
              </header>

              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Your Goal</label>
                    <select 
                      value={dietGoal}
                      onChange={(e) => setDietGoal(e.target.value)}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option>Weight Loss</option>
                      <option>Muscle Gain</option>
                      <option>Maintenance</option>
                      <option>Six Pack Shred</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Dietary Preference</label>
                    <select 
                      value={dietaryType}
                      onChange={(e) => setDietaryType(e.target.value)}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option value="Veg">Veg (Vegetarian)</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Eggitarian">Eggitarian</option>
                      <option value="Pescatarian">Pescatarian</option>
                      <option value="Other">Other (Specify below)</option>
                    </select>
                  </div>
                </div>

                {dietaryType === 'Other' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Specify Dietary Preference</label>
                    <input 
                      type="text"
                      value={otherDietaryDetails}
                      onChange={(e) => setOtherDietaryDetails(e.target.value)}
                      placeholder="e.g., Gluten-free, No dairy, etc."
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Additional Details</label>
                  <textarea 
                    value={dietDetails}
                    onChange={(e) => setDietDetails(e.target.value)}
                    placeholder="E.g., I'm 25, 180cm, 80kg, work out 4 times a week. I dislike broccoli."
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 h-32 resize-none"
                  />
                </div>

                <button 
                  onClick={handleGenerateDiet}
                  disabled={isDietLoading}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-50"
                >
                  {isDietLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap size={20} />
                  )}
                  Generate My Plan
                </button>
              </div>

              {generatedDiet && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm prose prose-sm max-w-none"
                >
                  <Markdown>{generatedDiet}</Markdown>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div 
              key="guide"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold">Exercise Guide</h2>
                <p className="text-black/40">Find the best exercises for your target body parts and goals.</p>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {bodyParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelectedBodyPart(part.id);
                      if (part.id !== 'Other') {
                        setCustomExerciseResult(null);
                        setCustomExerciseSearch('');
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all gap-3",
                      selectedBodyPart === part.id 
                        ? "bg-black border-black text-white shadow-xl shadow-black/20" 
                        : "bg-white border-black/5 text-black/60 hover:border-black/20"
                    )}
                  >
                    <span className="text-2xl">{part.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-center">{part.label}</span>
                  </button>
                ))}
              </div>

              {selectedBodyPart === 'Other' && (
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6 max-w-2xl mx-auto w-full">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Search Any Exercise</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={customExerciseSearch}
                        onChange={(e) => setCustomExerciseSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomExerciseSearch()}
                        placeholder="E.g., Kettlebell Swings, Bulgarian Split Squats..." 
                        className="w-full bg-black/5 border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <button 
                        onClick={handleCustomExerciseSearch}
                        disabled={isCustomExerciseLoading || !customExerciseSearch.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                      >
                        {isCustomExerciseLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Search size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedBodyPart && selectedBodyPart !== 'Other' ? (
                  filteredGuideExercises.length > 0 ? (
                    filteredGuideExercises.map(exercise => (
                      <div key={exercise.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                              {exercise.category}
                            </span>
                            <h3 className="text-xl font-bold mt-2">{exercise.name}</h3>
                            {exercise.recommendedSets && (
                              <p className="text-xs font-bold text-blue-600 mt-1">{exercise.recommendedSets}</p>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              if (!currentSession) startNewWorkout();
                              addExerciseToWorkout(exercise);
                              setActiveTab('workout');
                            }}
                            className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Instructions</p>
                          <ul className="text-sm text-black/50 space-y-1">
                            {exercise.instructions?.map((step, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-black/20 font-bold">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-black/5">
                      <p className="text-black/40">No exercises found for this category yet. We're adding more soon!</p>
                    </div>
                  )
                ) : selectedBodyPart === 'Other' ? (
                  customExerciseResult && (
                    <div className="col-span-full bg-white p-8 rounded-3xl border border-black/5 shadow-sm prose prose-sm max-w-none">
                      <Markdown>{customExerciseResult}</Markdown>
                    </div>
                  )
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-black/5">
                    <Search className="mx-auto text-black/10 mb-4" size={48} />
                    <p className="text-black/40">Select a body part or goal above to see recommended exercises.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'water' && (
            <motion.div 
              key="water"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold">Water Tracker</h2>
                  <p className="text-black/40">Stay hydrated to maximize your performance.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold">
                  <Droplets size={20} />
                  {waterData.goal > 0 ? Math.round((waterData.currentIntake / waterData.goal) * 100) : 0}%
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Tracker */}
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-black/5"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={552.92}
                        strokeDashoffset={552.92 * (1 - Math.min(waterData.goal > 0 ? waterData.currentIntake / waterData.goal : 0, 1))}
                        className="text-blue-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{waterData.currentIntake}</span>
                      <span className="text-black/40 text-sm font-medium">/ {waterData.goal} ml</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full">
                    {[250, 500, 750].map(amount => (
                      <button
                        key={amount}
                        onClick={() => {
                          setWaterData(prev => ({
                            ...prev,
                            currentIntake: prev.currentIntake + amount,
                            logs: [{ amount, timestamp: new Date().toISOString() }, ...prev.logs]
                          }));
                        }}
                        className="bg-blue-50 text-blue-600 py-3 rounded-2xl font-bold hover:bg-blue-100 transition-all active:scale-95"
                      >
                        +{amount}ml
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reminders & Settings */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          waterData.reminderEnabled ? "bg-blue-500 text-white" : "bg-black/5 text-black/40"
                        )}>
                          {waterData.reminderEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold">Hydration Reminder</h4>
                          <p className="text-xs text-black/40">In-app alerts & sound</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setWaterData(prev => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          waterData.reminderEnabled ? "bg-blue-500" : "bg-black/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          waterData.reminderEnabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-black/40 uppercase tracking-wider">
                        <span>Reminder Interval</span>
                        <span>{waterData.reminderInterval} min</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="180"
                        step="15"
                        value={waterData.reminderInterval}
                        onChange={(e) => setWaterData(prev => ({ ...prev, reminderInterval: Number(e.target.value) }))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Daily Goal (ml)</label>
                      <input
                        type="number"
                        value={waterData.goal}
                        onChange={(e) => setWaterData(prev => ({ ...prev, goal: Number(e.target.value) }))}
                        className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Recent Logs */}
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                    <h4 className="font-bold mb-4">Today's Logs</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                      {waterData.logs.length === 0 ? (
                        <p className="text-sm text-black/30 text-center py-4">No water logged today.</p>
                      ) : (
                        waterData.logs.map((log, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-black/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Droplets size={16} className="text-blue-500" />
                              <span className="font-bold">{log.amount}ml</span>
                            </div>
                            <span className="text-xs text-black/30">{format(new Date(log.timestamp), 'h:mm a')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calories' && (
            <motion.div 
              key="calories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold">Calorie Burn Calculator</h2>
                <p className="text-black/40">Accurately estimate how many calories you've burned during your workout.</p>
              </header>

              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Exercise Name</label>
                    <input 
                      type="text"
                      value={burnExercise}
                      onChange={(e) => setBurnExercise(e.target.value)}
                      placeholder="e.g., Running, Swimming, Yoga"
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Duration (minutes)</label>
                    <input 
                      type="number"
                      value={burnDuration}
                      onChange={(e) => setBurnDuration(Number(e.target.value))}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Intensity</label>
                    <select 
                      value={burnIntensity}
                      onChange={(e) => setBurnIntensity(e.target.value)}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option>Low</option>
                      <option>Moderate</option>
                      <option>High</option>
                      <option>Very High / Max Effort</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black/40 uppercase tracking-wider">Your Weight (kg)</label>
                    <input 
                      type="number"
                      value={burnWeight}
                      onChange={(e) => setBurnWeight(Number(e.target.value))}
                      className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCalculateBurn}
                  disabled={isBurnLoading || !burnExercise.trim()}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-50"
                >
                  {isBurnLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Flame size={20} />
                  )}
                  Calculate Burn
                </button>
              </div>

              {burnResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm prose prose-sm max-w-none"
                >
                  <Markdown>{burnResult}</Markdown>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div 
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold">Progress & Daily Logs</h2>
                  <p className="text-black/40">Track your daily activity and calorie burn over time.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold">
                  <Flame size={20} />
                  {dailyProgress[0]?.totalCalories || 0} kcal today
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Log Activity Form */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg">Log Today's Activity</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Activity</label>
                        <input 
                          type="text"
                          placeholder="e.g., Morning Run"
                          className="w-full bg-black/5 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              if (target.value) {
                                handleLogActivity(target.value, 30, 'Moderate');
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-black/30 italic">Press Enter to log with default 30m Moderate intensity, or use the Calorie Burn tab for custom logs.</p>
                    </div>

                    <div className="pt-4 border-t border-black/5">
                      <h4 className="font-bold text-sm mb-4">Today's Activities</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                        {dailyProgress.find(p => p.date === new Date().toDateString())?.activities.length === 0 || !dailyProgress.find(p => p.date === new Date().toDateString()) ? (
                          <p className="text-sm text-black/30 text-center py-4">No activities logged today.</p>
                        ) : (
                          dailyProgress.find(p => p.date === new Date().toDateString())?.activities.map((activity) => (
                            <div key={activity.id} className="flex justify-between items-center p-3 bg-black/5 rounded-xl">
                              <div>
                                <p className="font-bold text-sm">{activity.exercise}</p>
                                <p className="text-[10px] text-black/40">{activity.duration}m • {activity.intensity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-600 text-sm">{activity.caloriesBurned}</p>
                                <p className="text-[10px] text-black/40">kcal</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Chart */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm h-[400px]">
                    <h3 className="font-bold text-lg mb-6">Calorie Burn Progress</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[...dailyProgress].reverse().slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#999' }}
                            tickFormatter={(str) => format(new Date(str), 'MMM d')}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#999' }}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                            labelFormatter={(str) => format(new Date(str), 'EEEE, MMM d')}
                          />
                          <Bar 
                            dataKey="totalCalories" 
                            fill="#10b981" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                          >
                            {dailyProgress.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#e2e8f0'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="bg-black/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Avg Daily</p>
                        <p className="text-xl font-bold">
                          {dailyProgress.length > 0 
                            ? Math.round(dailyProgress.reduce((acc, curr) => acc + curr.totalCalories, 0) / dailyProgress.length) 
                            : 0}
                        </p>
                      </div>
                      <div className="bg-black/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Total Week</p>
                        <p className="text-xl font-bold">
                          {dailyProgress.slice(0, 7).reduce((acc, curr) => acc + curr.totalCalories, 0)}
                        </p>
                      </div>
                      <div className="bg-black/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Best Day</p>
                        <p className="text-xl font-bold">
                          {dailyProgress.length > 0 ? Math.max(...dailyProgress.map(p => p.totalCalories)) : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-2rem)] p-8 max-w-4xl mx-auto flex flex-col"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Assistance</h2>
                  <p className="text-black/40 text-sm">Powered by Gemini • Expert fitness advice & Problem solving</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 scrollbar-hide">
                {aiMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] p-6 rounded-3xl",
                      msg.role === 'user' 
                        ? "bg-black text-white rounded-tr-none" 
                        : "bg-white border border-black/5 rounded-tl-none shadow-sm"
                    )}>
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isAILoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-black/5 p-6 rounded-3xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about exercises, diet, or routines..." 
                  className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 pr-16 shadow-lg focus:ring-2 focus:ring-black/5 outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isAILoading || !inputMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div 
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold">Saved Files</h2>
                <p className="text-black/40">Access your saved diet plans, workout suggestions, and AI chats.</p>
              </header>

              {savedItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
                  <Save size={48} className="mx-auto text-black/10 mb-4" />
                  <p className="text-black/40">No saved items yet. Generate a diet plan or chat with AI to see them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedItems.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            item.type === 'diet' ? "bg-red-50 text-red-500" :
                            item.type === 'ai_chat' ? "bg-purple-50 text-purple-500" :
                            "bg-blue-50 text-blue-500"
                          )}>
                            {item.type === 'diet' ? <Apple size={20} /> :
                             item.type === 'ai_chat' ? <MessageSquare size={20} /> :
                             <Save size={20} />}
                          </div>
                          <div>
                            <h3 className="font-bold">{item.title}</h3>
                            <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">
                              {format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteSavedItem(item.id)}
                          className="p-2 text-black/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="bg-black/5 p-6 rounded-2xl max-h-64 overflow-y-auto prose prose-sm max-w-none">
                        <Markdown>{item.content}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'store' && (
            <motion.div 
              key="store"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">FORGE ELITE FITNESS Store</h2>
                  <p className="text-black/40">Premium gym gear and supplements for your journey.</p>
                </div>
                {!isAdminMode ? (
                  <button 
                    onClick={() => setShowAdminLogin(true)}
                    className="flex items-center gap-2 text-xs font-bold text-black/20 hover:text-black transition-colors"
                  >
                    <Lock size={14} />
                    Admin Access
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsAdminMode(false)}
                    className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Lock size={14} />
                    Exit Admin Mode
                  </button>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-black/5 transition-all">
                    <div className="aspect-square relative overflow-hidden bg-black/5">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {isAdminMode && (
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{product.category}</span>
                        <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                        <p className="text-xs text-black/40 line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold">${product.price}</span>
                        <button 
                          onClick={() => setCheckoutProduct(product)}
                          className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-black/80 transition-all active:scale-95"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isAdminMode && orders.length > 0 && (
                <div className="mt-12 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Package size={20} className="text-emerald-500" />
                    Recent Orders
                  </h3>
                  <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/5">
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Product</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Customer</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Contact</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Address</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-sm">{order.productName}</div>
                              <div className="text-xs text-black/40">${order.price}</div>
                            </td>
                            <td className="p-4 font-medium text-sm">{order.customerName}</td>
                            <td className="p-4">
                              <div className="text-xs font-medium">{order.email}</div>
                              <div className="text-xs text-black/40">{order.phone}</div>
                            </td>
                            <td className="p-4 text-xs text-black/60 max-w-[200px] truncate">{order.address}</td>
                            <td className="p-4 text-xs text-black/40">{format(new Date(order.timestamp), 'MMM d, yyyy')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'admin' && isAdminMode && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">System Administration</h2>
                  <p className="text-black/40">Full access to users, orders, and system configuration.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsAdminMode(false);
                    setActiveTab('dashboard');
                  }}
                  className="bg-red-50 text-red-500 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all"
                >
                  Exit Admin Panel
                </button>
              </header>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-emerald-500">${orders.reduce((acc, o) => acc + o.price, 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">Active Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">Guest Users</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Management */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart size={20} className="text-blue-500" />
                    Order Management
                  </h3>
                  <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10">
                          <tr className="bg-black/5">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Order ID</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Customer</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Amount</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-black/20 italic">No orders yet</td>
                            </tr>
                          ) : (
                            orders.map(order => (
                              <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                                <td className="p-4 text-xs font-mono">#{order.id}</td>
                                <td className="p-4">
                                  <div className="font-bold text-xs">{order.customerName}</div>
                                  <div className="text-[10px] text-black/40">{order.email}</div>
                                </td>
                                <td className="p-4 font-bold text-xs">${order.price}</td>
                                <td className="p-4">
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete this order?')) {
                                        setOrders(prev => prev.filter(o => o.id !== order.id));
                                      }
                                    }}
                                    className="p-2 text-black/10 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Product Management */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Package size={20} className="text-emerald-500" />
                    Inventory Control
                  </h3>
                  <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10">
                          <tr className="bg-black/5">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Product</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Price</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {products.map(product => (
                            <tr key={product.id} className="hover:bg-black/[0.02] transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img src={product.image} className="w-8 h-8 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                                  <div className="font-bold text-xs">{product.name}</div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-xs">${product.price}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setEditingProduct(product)}
                                    className="p-2 text-black/10 hover:text-black transition-colors"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete this product?')) {
                                        setProducts(prev => prev.filter(p => p.id !== product.id));
                                      }
                                    }}
                                    className="p-2 text-black/10 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const newProd: Product = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: 'New Product',
                        price: 0,
                        image: 'https://picsum.photos/seed/new/400/400',
                        description: 'Product description here...',
                        category: 'General'
                      };
                      setProducts(prev => [...prev, newProd]);
                      setEditingProduct(newProd);
                    }}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all"
                  >
                    <Plus size={20} />
                    Add New Product
                  </button>
                </div>
              </div>

              {/* User Management (Simulated) */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users size={20} className="text-purple-500" />
                  User Database
                </h3>
                <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/5">
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">User</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Status</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Last Active</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {[
                        { name: 'Alex Thompson', email: 'alex@example.com', status: 'Active', date: '2 mins ago' },
                        { name: 'Sarah Miller', email: 'sarah@fit.com', status: 'Guest', date: '1 hour ago' },
                        { name: 'Mike Ross', email: 'mike@gym.io', status: 'Inactive', date: '2 days ago' },
                      ].map((user, i) => (
                        <tr key={i} className="hover:bg-black/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-sm">{user.name}</div>
                            <div className="text-xs text-black/40">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              user.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                              user.status === 'Guest' ? "bg-blue-50 text-blue-600" :
                              "bg-black/5 text-black/40"
                            )}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-black/40">{user.date}</td>
                          <td className="p-4">
                            <button className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">Suspend</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
            >
              <header>
                <h2 className="text-3xl font-bold">Settings</h2>
                <p className="text-black/40">Manage your account and app preferences.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users size={20} className="text-emerald-500" />
                      Account Management
                    </h3>
                    <div className="space-y-4">
                      <button 
                        onClick={handleSwitchAccounts}
                        className="w-full flex items-center justify-between p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Users size={20} className="text-black/40 group-hover:text-black" />
                          <span className="font-bold">Switch Account</span>
                        </div>
                        <ChevronRight size={20} className="text-black/20" />
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <LogIn size={20} className="text-red-500 group-hover:text-red-600 rotate-180" />
                          <span className="font-bold text-red-500">Log Out</span>
                        </div>
                        <ChevronRight size={20} className="text-red-300" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <SettingsIcon size={20} className="text-blue-500" />
                      App Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                        <span className="font-bold">Dark Mode</span>
                        <div className="w-12 h-6 bg-black/10 rounded-full relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                        <span className="font-bold">Notifications</span>
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-500" />
                    Feedback & Support
                  </h3>
                  <p className="text-sm text-black/40 leading-relaxed">
                    Having trouble? Or have a suggestion? Send us a message and we'll get back to you as soon as possible.
                  </p>
                  <div className="space-y-4">
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all h-40 resize-none"
                    />
                    <button 
                      onClick={handleSendFeedback}
                      disabled={isSendingFeedback || !feedback.trim()}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95",
                        feedbackSuccess ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-black/80 disabled:opacity-50"
                      )}
                    >
                      {isSendingFeedback ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : feedbackSuccess ? (
                        <>
                          <CheckCircle2 size={20} />
                          Feedback Sent!
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store Modals */}
        <AnimatePresence>
          {showAdminLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowAdminLogin(false)}
                  className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Admin Login</h3>
                    <p className="text-black/40 text-sm">Enter password to manage products.</p>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Password</label>
                      <input 
                        type="password" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all active:scale-95"
                    >
                      Login
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}

          {editingProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Edit Product</h3>
                  <form onSubmit={handleUpdateProduct} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Product Name</label>
                      <input 
                        name="name"
                        defaultValue={editingProduct.name}
                        required
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Price ($)</label>
                      <input 
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingProduct.price}
                        required
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Image URL</label>
                      <input 
                        name="image"
                        defaultValue={editingProduct.image}
                        required
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Description</label>
                      <textarea 
                        name="description"
                        defaultValue={editingProduct.description}
                        required
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all h-24 resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all active:scale-95"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}

          {checkoutProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button 
                  onClick={() => setCheckoutProduct(null)}
                  className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-black/5 rounded-2xl">
                    <img src={checkoutProduct.image} alt="" className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-bold">{checkoutProduct.name}</h3>
                      <p className="text-emerald-500 font-bold">${checkoutProduct.price}</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">Checkout</h3>
                  <form onSubmit={handleOrder} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        name="name"
                        required
                        placeholder="John Doe"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        name="phone"
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Shipping Address</label>
                      <textarea 
                        name="address"
                        required
                        placeholder="123 Gym St, Fitness City, 90210"
                        className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all h-24 resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all active:scale-95"
                    >
                      Place Order
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
        active ? "bg-black text-white shadow-lg shadow-black/10" : "text-black/40 hover:bg-black/5 hover:text-black"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", active ? "scale-110" : "")}>
        {icon}
      </span>
      <span className="hidden md:block font-semibold text-sm">{label}</span>
      {active && <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-white rounded-full ml-1 md:hidden" />}
    </button>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-4"
    >
      <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-black/40 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black/5 rounded-2xl">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{trend}</span>
      </div>
      <h4 className="text-black/40 text-sm font-medium">{title}</h4>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
