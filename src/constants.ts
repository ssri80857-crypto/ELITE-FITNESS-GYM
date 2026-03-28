import { Exercise } from './types';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    category: 'Strength',
    targetMuscle: 'Chest',
    equipment: 'Barbell',
    recommendedSets: '3-4 sets of 8-12 reps',
    instructions: ['Lie on the bench', 'Lower the bar to mid-chest', 'Push back up']
  },
  {
    id: '2',
    name: 'Squat',
    category: 'Strength',
    targetMuscle: 'Legs',
    equipment: 'Barbell',
    recommendedSets: '3-5 sets of 5-10 reps',
    instructions: ['Place bar on upper back', 'Lower hips until thighs are parallel to floor', 'Drive back up']
  },
  {
    id: '3',
    name: 'Deadlift',
    category: 'Strength',
    targetMuscle: 'Back',
    equipment: 'Barbell',
    recommendedSets: '1-3 sets of 5 reps',
    instructions: ['Stand with feet mid-foot under bar', 'Bend over and grab bar', 'Lift bar by standing up']
  },
  {
    id: '4',
    name: 'Overhead Press',
    category: 'Strength',
    targetMuscle: 'Shoulders',
    equipment: 'Barbell',
    recommendedSets: '3-4 sets of 8-10 reps',
    instructions: ['Hold bar at shoulder height', 'Press bar overhead until arms are locked', 'Lower back to shoulders']
  },
  {
    id: '5',
    name: 'Pull Up',
    category: 'Strength',
    targetMuscle: 'Back',
    recommendedSets: '3 sets to failure',
    instructions: ['Grab bar with overhand grip', 'Pull body up until chin is over bar', 'Lower back down']
  },
  {
    id: '6',
    name: 'Bicep Curl',
    category: 'Strength',
    targetMuscle: 'Arms',
    equipment: 'Dumbbells',
    recommendedSets: '3 sets of 12-15 reps',
    instructions: ['Hold dumbbells at sides', 'Curl weights toward shoulders', 'Lower back down']
  },
  {
    id: '7',
    name: 'Plank',
    category: 'Strength',
    targetMuscle: 'Abs',
    goal: 'Six Pack',
    recommendedSets: '3 sets of 30-60 seconds',
    instructions: ['Start in pushup position but on elbows', 'Keep body in straight line', 'Hold as long as possible']
  },
  {
    id: '8',
    name: 'Crunches',
    category: 'Strength',
    targetMuscle: 'Abs',
    goal: 'Six Pack',
    recommendedSets: '3 sets of 15-20 reps',
    instructions: ['Lie on back with knees bent', 'Curl shoulders toward pelvis', 'Lower back down']
  },
  {
    id: '9',
    name: 'Leg Raises',
    category: 'Strength',
    targetMuscle: 'Abs',
    goal: 'Six Pack',
    recommendedSets: '3 sets of 12-15 reps',
    instructions: ['Lie on back with legs straight', 'Lift legs to 90 degrees', 'Lower slowly without touching floor']
  },
  {
    id: '10',
    name: 'Burpees',
    category: 'HIIT',
    targetMuscle: 'Full Body',
    goal: 'Weight Loss',
    recommendedSets: '4 sets of 10-15 reps',
    instructions: ['Start standing', 'Drop to squat and kick legs back', 'Do a pushup', 'Jump back to squat and jump up']
  },
  {
    id: '11',
    name: 'Mountain Climbers',
    category: 'HIIT',
    targetMuscle: 'Full Body',
    goal: 'Weight Loss',
    recommendedSets: '3 sets of 45 seconds',
    instructions: ['Start in plank position', 'Drive knees toward chest alternately', 'Keep pace fast']
  },
  {
    id: '12',
    name: 'Jump Rope',
    category: 'Cardio',
    targetMuscle: 'Full Body',
    goal: 'Weight Loss',
    recommendedSets: '5 sets of 2 minutes',
    instructions: ['Hold rope handles', 'Swing rope over head', 'Jump as it passes under feet']
  }
];
