
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DayData, UserProfile, Meal } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNutritionalAnalysis(
  analysisText: string,
  userProfile: UserProfile
): Omit<DayData, 'date' | 'creatineTaken' | 'proteinTaken'> {
  const meals: DayData['meals'] = {};
  let observations = '';

  const lines = analysisText.split('\n').filter(line => line.trim() !== '');

  const mealHeaderRegex = /^\*?\*?(Breakfast|Lunch|Dinner|Snack)\*?\*?:\s*(.*)/i;
  const nutritionLineRegex = /^\*\s*([\d,.]*)\s*kcal\s*\|\s*([\d,.]*)\s*g protein\s*\|\s*([\d,.]*)\s*g fat\s*\|\s*([\d,.]*)\s*g carbohydrates/i;
  const observationsRegex = /^💡\s*\*?Observations\*?\*?:\s*(.*)/i;

  let currentMealType: keyof DayData['meals'] | null = null;
  let inObservationsSection = false;
  let tempObservations: string[] = [];

  for (const line of lines) {
    if (inObservationsSection) {
        tempObservations.push(line);
        continue;
    }

    const mealMatch = line.match(mealHeaderRegex);
    if (mealMatch) {
      currentMealType = mealMatch[1].toLowerCase() as keyof DayData['meals'];
      meals[currentMealType] = {
        description: mealMatch[2].trim(),
        calories: 0, protein: 0, fat: 0, carbs: 0,
      };
      continue;
    }

    if (currentMealType) {
      const nutritionMatch = line.match(nutritionLineRegex);
      if (nutritionMatch && meals[currentMealType]) {
          meals[currentMealType]!.calories = parseFloat(nutritionMatch[1].replace(/,/g, '')) || 0;
          meals[currentMealType]!.protein = parseFloat(nutritionMatch[2].replace(/,/g, '')) || 0;
          meals[currentMealType]!.fat = parseFloat(nutritionMatch[3].replace(/,/g, '')) || 0;
          meals[currentMealType]!.carbs = parseFloat(nutritionMatch[4].replace(/,/g, '')) || 0;
          currentMealType = null; // Reset after finding nutrition info
          continue;
      }
    }
    
    const obsMatch = line.match(observationsRegex);
    if (obsMatch) {
        inObservationsSection = true;
        if (obsMatch[1].trim()) {
            tempObservations.push(obsMatch[1].trim());
        }
        continue;
    }
  }

  // Calculate totals by summing up parsed meals
  const totals: DayData['totals'] = Object.values(meals).reduce(
    (acc, meal) => {
        if(meal) {
            acc.calories += meal.calories;
            acc.protein += meal.protein;
            acc.fat += meal.fat;
            acc.carbs += meal.carbs;
        }
        return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  observations = tempObservations.join('\n').trim();

  let status: 'green' | 'yellow' | 'red' = 'green';
  const calorieDiff = Math.abs(totals.calories - userProfile.dailyCalorieGoal);
  if (calorieDiff > 400) {
    status = 'red';
  } else if (calorieDiff > 200) {
    status = 'yellow';
  }
  
  return {
    meals,
    totals,
    observations,
    status,
  };
}
