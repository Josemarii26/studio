
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

  const mealHeaderRegex = /^\*?\*?(Breakfast|Lunch|Dinner|Snack)\*?\*?:\s*(.*)/i;
  const nutritionLineRegex = /^\*\s*([\d,.]*)\s*kcal\s*\|\s*([\d,.]*)\s*g protein\s*\|\s*([\d,.]*)\s*g fat\s*\|\s*([\d,.]*)\s*g carbohydrates/i;
  
  const totalsHeaderRegex = /^\*?\*?Totals for the day\*?\*?:?/i;
  const observationsRegex = /^💡\s*\*?Observations\*?\*?:\s*(.*)/i;

  let currentMealType: keyof DayData['meals'] | null = null;
  let inTotalsSection = false;
  let inObservationsSection = false;
  let tempObservations: string[] = [];

  for (const line of lines) {
    if (inObservationsSection) {
        tempObservations.push(line);
        continue;
    }

    if (inTotalsSection) {
        const caloriesMatch = line.match(/Calories:\*?\s*([\d,.]*)\s*kcal/i);
        if (caloriesMatch) totals.calories = parseFloat(caloriesMatch[1].replace(/,/g, '')) || 0;

        const proteinMatch = line.match(/Protein:\*?\s*([\d,.]*)\s*g/i);
        if (proteinMatch) totals.protein = parseFloat(proteinMatch[1].replace(/,/g, '')) || 0;

        const fatMatch = line.match(/Fats?:\*?\s*([\d,.]*)\s*g/i);
        if (fatMatch) totals.fat = parseFloat(fatMatch[1].replace(/,/g, '')) || 0;
        
        const carbsMatch = line.match(/Carbohydrates:\*?\s*([\d,.]*)\s*g/i);
        if (carbsMatch) totals.carbs = parseFloat(carbsMatch[1].replace(/,/g, '')) || 0;

        const obsMatch = line.match(observationsRegex);
        if(obsMatch) {
            inTotalsSection = false;
            inObservationsSection = true;
            if (obsMatch[1].trim()) {
                tempObservations.push(obsMatch[1].trim());
            }
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
    
    if (totalsHeaderRegex.test(line)) {
        inTotalsSection = true;
        continue;
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
