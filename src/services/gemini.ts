import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-3-flash-preview";

export async function generateDietPlan(userDetails: string) {
  const prompt = `Generate a comprehensive, personalized diet plan based on these details: ${userDetails}. 
  Include:
  1. Daily calorie and macronutrient targets.
  2. A sample 1-day meal plan (Breakfast, Lunch, Dinner, Snacks).
  3. Grocery list suggestions.
  4. Hydration and supplement advice.
  Use markdown for formatting.`;
  
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a certified sports nutritionist. Provide practical, healthy, and goal-oriented diet plans.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Diet Plan Error:", error);
    return "Failed to generate diet plan. Please check your details and try again.";
  }
}
export async function getExerciseDetails(exerciseName: string) {
  const prompt = `Provide detailed instructions for the exercise: "${exerciseName}". 
  Include:
  1. Category (Strength, Cardio, HIIT, etc.)
  2. Target Muscle
  3. Equipment needed
  4. Recommended Sets and Reps (e.g., 3 sets of 10-12 reps)
  5. Step-by-step instructions (as a list)
  Return the response in a clear, structured format using markdown.`;
  
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert fitness coach. Provide clear, safe, and effective exercise instructions.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Exercise Details Error:", error);
    return "Failed to find details for this exercise. Please try another name.";
  }
}
export async function calculateCaloriesBurned(exercise: string, duration: number, intensity: string, weight: number) {
  const prompt = `Calculate the approximate calories burned for the following activity:
  Exercise: ${exercise}
  Duration: ${duration} minutes
  Intensity: ${intensity}
  User Weight: ${weight} kg
  
  Provide a clear explanation of how you arrived at this number (MET values, etc.) and give a final estimated range. 
  Use markdown for formatting.`;
  
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert exercise physiologist. Provide accurate, science-based estimates for calories burned during physical activity.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Calorie Calculation Error:", error);
    return "Failed to calculate calories. Please try again.";
  }
}
export async function getCalorieEstimate(exercise: string, duration: number, intensity: string, weight: number): Promise<number> {
  const prompt = `Calculate the approximate calories burned for:
  Exercise: ${exercise}
  Duration: ${duration} minutes
  Intensity: ${intensity}
  User Weight: ${weight} kg
  
  Return ONLY the numerical value of the estimated calories burned. No text, no units. Just the number.`;
  
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a precise calorie calculator. Return only the number.",
      },
    });
    const text = response.text?.trim() || "0";
    const calories = parseInt(text.replace(/[^0-9]/g, ''));
    return isNaN(calories) ? 0 : calories;
  } catch (error) {
    console.error("Calorie Estimate Error:", error);
    return 0;
  }
}
export async function getFitnessAdvice(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: "You are FORGE ELITE FITNESS AI, a world-class personal trainer and nutritionist. Provide concise, science-based fitness advice. Use markdown for formatting. If asked for a workout plan, provide it in a structured format.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to my fitness knowledge base right now.";
  }
}
