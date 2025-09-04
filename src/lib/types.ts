
export type Meal = {
  description: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type DayData = {
  date: Date;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
  };
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  status: 'green' | 'yellow' | 'red';
  observations: string;
  creatineTaken?: boolean;
  proteinTaken?: boolean;
};

export type UserProfile = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
  goalWeight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  goal: 'lose' | 'maintain' | 'gain';
  supplementation: 'none' | 'creatine' | 'protein' | 'both';
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyFatGoal: number;
  dailyCarbsGoal: number;
  bmi: number;
  photoUrl: string | null;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};
