
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DayData, UserProfile } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNutritionalAnalysis(
  analysisText: string,
  userProfile: UserProfile
): Omit<DayData, 'date' | 'creatineTaken' | 'proteinTaken'> {
  const meals: DayData['meals'] = {};
  const totals: DayData['totals'] = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  let observations = '';

  const lines = analysisText.split('\n');

  // Regex for parsing each part, now English-only
  const mealHeaderRegex = /^\*?\*?(Breakfast|Lunch|Dinner|Snack):\*?\*?\s*(.*)/i;
  const nutritionLineRegex = /^\*\s*([\d,.]*)\s*kcal\s*\|\s*([\d,.]*)\s*g protein\s*\|\s*([\d,.]*)\s*g fat\s*\|\s*([\d,.]*)\s*g carbohydrates/i;
  const totalsRegex = /^\*?\*?\s*(Calories|Protein|Fats|Carbohydrates):\s*\*?\*?\s*([\d,.]*)/i;
  const observationsRegex = /^💡\s*\*?Observations:\*?\s*(.*)/i;

  let currentMealType: keyof DayData['meals'] | null = null;
  let isParsingObservations = false;

  for (const line of lines) {
    if (line.trim() === '') {
        isParsingObservations = false; // Stop parsing observations on empty line
        continue;
    }

    // Start of observations section
    const obsMatch = line.match(observationsRegex);
    if (obsMatch) {
      observations = obsMatch[1].trim();
      isParsingObservations = true;
      continue;
    }
    
    if (isParsingObservations) {
        observations += `\n${line.trim()}`;
        continue;
    }

    // Match meal headers
    const mealMatch = line.match(mealHeaderRegex);
    if (mealMatch) {
      const mealTypeStr = mealMatch[1].toLowerCase() as keyof DayData['meals'];
      currentMealType = mealTypeStr;
      meals[currentMealType] = {
        description: mealMatch[2].trim(),
        calories: 0, protein: 0, fat: 0, carbs: 0,
      };
      continue;
    }

    // Match nutrition line for the current meal
    if (currentMealType) {
        const nutritionMatch = line.match(nutritionLineRegex);
        if (nutritionMatch && meals[currentMealType]) {
            meals[currentMealType]!.calories = parseFloat(nutritionMatch[1].replace(/,/g, '')) || 0;
            meals[currentMealType]!.protein = parseFloat(nutritionMatch[2].replace(/,/g, '')) || 0;
            meals[currentMealType]!.fat = parseFloat(nutritionMatch[3].replace(/,/g, '')) || 0;
            meals[currentMealType]!.carbs = parseFloat(nutritionMatch[4].replace(/,/g, '')) || 0;
            currentMealType = null; // Reset after finding nutrition
            continue;
        }
    }

    // Match totals
    const totalMatch = line.match(totalsRegex);
    if (totalMatch) {
      const key = totalMatch[1].toLowerCase();
      const value = parseFloat(totalMatch[2].replace(/,/g, '')) || 0;
      if (key === 'calories') totals.calories = value;
      if (key === 'protein') totals.protein = value;
      if (key === 'fats') totals.fat = value;
      if (key === 'carbohydrates') totals.carbs = value;
    }
  }

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
    observations: observations.trim(),
    status,
  };
}
