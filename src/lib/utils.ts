
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

  const mealHeaderRegex = /^\*?\*?(Breakfast|Lunch|Dinner|Snack):\*?\*?\s*(.*)/i;
  const nutritionLineRegex = /^\*\s*([\d,.]*)\s*kcal\s*\|\s*([\d,.]*)\s*g protein\s*\|\s*([\d,.]*)\s*g fat\s*\|\s*([\d,.]*)\s*g carbohydrates/i;
  const observationsRegex = /^💡\s*\*?Observations:\*?\s*(.*)/i;
  
  const totalsSectionRegex = /^\*?\*?Totals for the day:\*?\*?/i;
  const caloriesRegex = /\*\s*Calories:\s*([\d,.]+)\s*kcal/i;
  const proteinRegex = /\*\s*Protein:\s*([\d,.]+)\s*g/i;
  const fatRegex = /\*\s*Fats:\s*([\d,.]+)\s*g/i;
  const carbsRegex = /\*\s*Carbohydrates:\s*([\d,.]+)\s*g/i;


  let currentMealType: keyof DayData['meals'] | null = null;
  let isParsingObservations = false;
  let isParsingTotals = false;

  for (const line of lines) {
    if (line.trim() === '') {
        isParsingObservations = false;
        isParsingTotals = false;
        continue;
    }

    if (isParsingObservations) {
        observations += `\n${line.trim()}`;
        continue;
    }
    
    if (isParsingTotals) {
        const calMatch = line.match(caloriesRegex);
        if (calMatch) totals.calories = parseFloat(calMatch[1].replace(/,/g, '')) || 0;

        const protMatch = line.match(proteinRegex);
        if (protMatch) totals.protein = parseFloat(protMatch[1].replace(/,/g, '')) || 0;
        
        const fatMatch = line.match(fatRegex);
        if (fatMatch) totals.fat = parseFloat(fatMatch[1].replace(/,/g, '')) || 0;

        const carbMatch = line.match(carbsRegex);
        if (carbMatch) totals.carbs = parseFloat(carbMatch[1].replace(/,/g, '')) || 0;
        
        const obsMatch = line.match(observationsRegex);
        if (obsMatch) {
            isParsingTotals = false;
            isParsingObservations = true;
            observations = obsMatch[1].trim();
        }
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
            currentMealType = null;
            continue;
        }
    }
    
    if(line.match(totalsSectionRegex)) {
        isParsingTotals = true;
        continue;
    }

    const obsMatch = line.match(observationsRegex);
    if (obsMatch) {
      isParsingObservations = true;
      observations = obsMatch[1].trim();
      continue;
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
