
// DO NOT use import.meta.env. Use process.env.API_KEY exclusively.
import { GoogleGenAI, Type } from "@google/genai";
import { Workout, Exercise, DietPlan, ElitePlan } from "../types";

// Always initialize GoogleGenAI with the apiKey from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWorkoutPlan = async (goal: string, level: string, days: number, requirements: string): Promise<Workout[]> => {
  const prompt = `Generate a ${days}-day workout plan for a ${level} level athlete with the goal: ${goal}. 
  The user has specified these additional requirements: ${requirements || 'None'}.
  Provide exactly ${days} workout sessions.
  Each workout should have a unique ID, a clear name, estimated duration, estimated total calories, and a list of exercises tailored to the requirements.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            calories: { type: Type.NUMBER },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.NUMBER },
                  reps: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name", "sets", "reps"]
              }
            },
            date: { type: Type.STRING }
          },
          required: ["id", "name", "duration", "calories", "exercises"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse AI workout plan", e);
    return [];
  }
};

export const calculateBurnedCalories = async (
  exercise: string, 
  duration: number, 
  weight: number, 
  intensity: string,
  sets: number = 0,
  reps: number = 0
): Promise<{ calories: number; breakdown: string }> => {
  const prompt = `Calculate the exact estimated calories burned for a person with the following details:
  Exercise: ${exercise}
  Duration: ${duration} minutes
  Weight: ${weight} kg
  Intensity: ${intensity}
  Sets: ${sets > 0 ? sets : 'N/A'}
  Reps/Times per set: ${reps > 0 ? reps : 'N/A'}
  
  Note: If sets and reps are provided, factor in the mechanical work and rest periods.
  Provide the result as a JSON object with 'calories' (number) and a 'breakdown' (string explanation).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          breakdown: { type: Type.STRING }
        },
        required: ["calories", "breakdown"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to calculate calories", e);
    throw e;
  }
};

export const generateEliteBeginnerPlan = async (lifestyle: string, goal: string): Promise<ElitePlan> => {
  const prompt = `Create a comprehensive fitness plan for a BEGINNER. 
  The user lifestyle/schedule is: ${lifestyle}. 
  Their goal is: ${goal}.
  
  Recommend:
  1. The specific best time of day to go (e.g. "6:30 AM before work").
  2. The total duration for each workout session in minutes.
  3. A 3-day beginner-friendly workout schedule.
  
  Include reasoning why this time and duration is best for a beginner with their lifestyle.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedTimeOfDay: { type: Type.STRING },
          sessionDurationMinutes: { type: Type.NUMBER },
          weeklyFrequency: { type: Type.NUMBER },
          justification: { type: Type.STRING },
          workouts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                calories: { type: Type.NUMBER },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sets: { type: Type.NUMBER },
                      reps: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["recommendedTimeOfDay", "sessionDurationMinutes", "workouts", "justification"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse elite beginner plan", e);
    throw e;
  }
};

export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  let instruction = `Recommend 5 effective exercises for the ${bodyPart}.`;
  if (bodyPart === 'Six Pack') {
    instruction = `Provide a comprehensive guide on how to build a six pack. Include 5 specific core exercises with sets, reps, and critical form notes for progressive overload.`;
  } else if (bodyPart === 'Weight Loss') {
    instruction = `Provide a workout guide for effective weight loss. Include 5 high-intensity or compound movements that maximize calorie burn, along with recommended sets and timing.`;
  }

  const prompt = `${instruction} 
  Include the exercise name, recommended sets (number), and reps (string). 
  Provide helpful notes/tips for form for each exercise.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ["name", "sets", "reps"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse exercises", e);
    return [];
  }
};

export const generateDietPlan = async (weight: number, height: number, goal: string): Promise<DietPlan> => {
  const prompt = `Generate a personalized daily diet plan for a user with the following biometrics:
  Weight: ${weight}kg, Height: ${height}cm, Goal: ${goal}.
  Provide a total daily calorie target, macro breakdown (Protein, Carbs, Fats), and a list of 4-5 meals for a full day. 
  Include helpful nutritionist tips for success.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyCalories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              fats: { type: Type.STRING }
            },
            required: ["protein", "carbs", "fats"]
          },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.NUMBER }
              },
              required: ["name", "time", "description", "calories"]
            }
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["dailyCalories", "macros", "meals", "tips"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse diet plan", e);
    throw new Error("Failed to generate diet plan");
  }
};

export const getCoachResponse = async (history: { role: 'user' | 'model'; content: string }[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
    config: {
      systemInstruction: "You are Forge Coach, an elite fitness and nutrition expert. Be encouraging, scientifically accurate, and brief. Focus on form, motivation, and practical tips.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

export const getAssistantResponse = async (history: { role: 'user' | 'model'; content: string }[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
    config: {
      systemInstruction: `You are Forge Core Nexus, the central AI System Assistant for the FORGE ELITE FITNESS app. 
      Your primary function is to solve technical problems, explain app features, and troubleshoot errors for the user.
      Features you know about: 
      - Dashboard: Performance tracking and logging.
      - Burn Calculator: Precision calorie estimation.
      - Diet Architect: Personalized nutrition planning.
      - Workout Log: Historical tracking of gains.
      - Hydration: Water reminder system and auto-resets.
      - Store: Elite gear and admin portal.
      - Feed: Community broadcasting.
      If the user has a technical problem, provide a step-by-step solution. Be professional, concise, and technically authoritative.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
