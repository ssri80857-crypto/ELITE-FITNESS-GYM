export type Exercise = {
  id: string;
  name: string;
  category: 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT';
  targetMuscle?: string;
  goal?: 'Six Pack' | 'Weight Loss' | 'Muscle Gain';
  equipment?: string;
  instructions?: string[];
  recommendedSets?: string;
};

export type Set = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  sets: Set[];
};

export type WorkoutSession = {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
  duration?: number; // in minutes
  notes?: string;
};

export type UserStats = {
  weight: number;
  height: number;
  goal: string;
  dailyCalories: number;
};

export type WaterLog = {
  amount: number;
  timestamp: string;
};

export type WaterTracking = {
  currentIntake: number;
  goal: number;
  logs: WaterLog[];
  lastResetDate: string;
  reminderEnabled: boolean;
  reminderInterval: number; // in minutes
};

export type DailyActivity = {
  id: string;
  exercise: string;
  duration: number;
  intensity: string;
  caloriesBurned: number;
  timestamp: string;
};

export type DailyProgress = {
  date: string;
  totalCalories: number;
  activities: DailyActivity[];
};

export type SavedItem = {
  id: string;
  type: 'diet' | 'workout' | 'search' | 'ai_chat';
  title: string;
  content: string;
  timestamp: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

export type Order = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  timestamp: string;
  status: 'pending' | 'shipped' | 'delivered';
};
