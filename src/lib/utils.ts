
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

  // Regex for parsing each part of the AI's response
  const mealHeaderRegex = /^\*?\*?(Breakfast|Lunch|Dinner|Snack)\*?\*?:\s*(.*)/i;
  const nutritionLineRegex = /^\*\s*([\d,.]*)\s*kcal\s*\|\s*([\d,.]*)\s*g protein\s*\|\s*([\d,.]*)\s*g fat\s*\|\s*([\d,.]*)\s*g carbohydrates/i;
  
  // First, parse all the meals and their data
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    const mealMatch = line.match(mealHeaderRegex);
    
    if (mealMatch) {
      const mealType = mealMatch[1].toLowerCase() as keyof DayData['meals'];
      const description = mealMatch[2].trim();
      
      const nextLine = lines[i + 1];
      const nutritionMatch = nextLine.match(nutritionLineRegex);
      
      if (nutritionMatch) {
        meals[mealType] = {
          description,
          calories: parseFloat(nutritionMatch[1].replace(/,/g, '')) || 0,
          protein: parseFloat(nutritionMatch[2].replace(/,/g, '')) || 0,
          fat: parseFloat(nutritionMatch[3].replace(/,/g, '')) || 0,
          carbs: parseFloat(nutritionMatch[4].replace(/,/g, '')) || 0,
        };
      }
    }
  }

  // Second, find and parse the observations section
  const observationsRegex = /^💡\s*\*?Observations\*?\*?:/i;
  const obsStartIndex = lines.findIndex(line => observationsRegex.test(line));

  if (obsStartIndex !== -1) {
    // Get the first line, removing the "Observations:" part
    const firstObsLine = lines[obsStartIndex].replace(observationsRegex, '').trim();
    const restObsLines = lines.slice(obsStartIndex + 1);
    
    // Join them all together
    observations = [firstObsLine, ...restObsLines].join('\n').trim();
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
