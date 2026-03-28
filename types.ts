
export enum View {
  DASHBOARD = 'dashboard',
  WORKOUTS = 'workouts',
  PLANNER = 'planner',
  COACH = 'coach',
  PROGRESS = 'progress',
  WATER = 'water',
  EXERCISES = 'exercises',
  DIET = 'diet',
  MAKE_PLAN = 'make_plan',
  CALORIES = 'calories',
  STORE = 'store',
  FEED = 'feed',
  ASSISTANT = 'assistant'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  password?: string;
}

export interface Workout {
  id: string;
  name: string;
  duration: number; // minutes
  calories: number;
  exercises: Exercise[];
  date: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  notes?: string;
}

export interface ProgressData {
  day: string;
  calories: number;
  duration: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface WaterEntry {
  amount: number;
  timestamp: number;
}

export interface WaterReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  soundEnabled: boolean;
  lastReminderTimestamp: number;
}

export interface Alarm {
  id: string;
  time: string; // HH:mm
  enabled: boolean;
  label: string;
}

export interface DietPlan {
  dailyCalories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  meals: {
    name: string;
    time: string;
    description: string;
    calories: number;
  }[];
  tips: string[];
}

export interface ElitePlan {
  recommendedTimeOfDay: string;
  sessionDurationMinutes: number;
  weeklyFrequency: number;
  justification: string;
  workouts: Workout[];
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string; // base64 string
}

export interface FeedPost {
  id: string;
  userName: string;
  userLevel: string;
  content: string;
  type: 'Problem' | 'Suggestion' | 'Feedback';
  timestamp: number;
  likes: number;
}
