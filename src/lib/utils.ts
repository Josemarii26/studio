
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
  const lines = analysisText.split('\n').filter(line => line.trim() !== '');

  const meals: DayData['meals'] = {};
  const totals: DayData['totals'] = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  let observations = '';

  const mealRegex = /\*?\*?(\w+):\*?\*? (.*?)$/i;
  const nutritionRegex = /\*? ([\d,.]+) kcal \| ([\d,.]+) g proteína \| ([\d,.]+) g grasa \| ([\d,.]+) g carbohidratos/i;
  const totalCaloriesRegex = /\* \*\*Calorías:\*\* ([\d,.]+) kcal/i;
  const totalProteinRegex = /\* \*\*Proteínas:\*\* ([\d,.]+) g/i;
  const totalFatRegex = /\* \*\*Grasas:\*\* ([\d,.]+) g/i;
  const totalCarbsRegex = /\* \*\*Carbohidratos:\*\* ([\d,.]+) g/i;
  const observationRegex = /💡 \*\*Observaciones:\*\*\n(.*?)$/s;
  
  let currentMealType: keyof DayData['meals'] | null = null;
  
  for (const line of lines) {
    const mealMatch = line.match(mealRegex);
    if (mealMatch) {
        const mealTypeStr = mealMatch[1].toLowerCase();
        if (['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'].includes(mealTypeStr)) {
            const mealTypeMap: { [key: string]: keyof DayData['meals'] } = {
                desayuno: 'breakfast',
                almuerzo: 'lunch',
                merienda: 'snack',
                cena: 'dinner',
                snack: 'snack',
            };
            currentMealType = mealTypeMap[mealTypeStr];
            if (currentMealType) {
                 meals[currentMealType] = {
                    description: mealMatch[2],
                    calories: 0, protein: 0, fat: 0, carbs: 0,
                 };
            }
        }
    }
    
    const nutritionMatch = line.match(nutritionRegex);
    if (nutritionMatch && currentMealType && meals[currentMealType]) {
        meals[currentMealType]!.calories = parseFloat(nutritionMatch[1].replace(/,/g, ''));
        meals[currentMealType]!.protein = parseFloat(nutritionMatch[2].replace(/,/g, ''));
        meals[currentMealType]!.fat = parseFloat(nutritionMatch[3].replace(/,/g, ''));
        meals[currentMealType]!.carbs = parseFloat(nutritionMatch[4].replace(/,/g, ''));
    }
  }

  const totalsMatch = analysisText.match(/🔢 Totales del día:([\s\S]*?)💡/);
  if(totalsMatch) {
    const totalsBlock = totalsMatch[1];
    const calMatch = totalsBlock.match(totalCaloriesRegex);
    if (calMatch) totals.calories = parseFloat(calMatch[1].replace(/,/g, ''));
    const protMatch = totalsBlock.match(totalProteinRegex);
    if (protMatch) totals.protein = parseFloat(protMatch[1].replace(/,/g, ''));
    const fatMatch = totalsBlock.match(totalFatRegex);
    if (fatMatch) totals.fat = parseFloat(fatMatch[1].replace(/,/g, ''));
    const carbMatch = totalsBlock.match(totalCarbsRegex);
    if (carbMatch) totals.carbs = parseFloat(carbMatch[1].replace(/,/g, ''));
  }
  
  const obsMatch = analysisText.match(observationRegex);
  if (obsMatch) {
      observations = obsMatch[1].trim();
  } else {
      const fallbackObs = analysisText.split('💡 Observaciones:');
      if (fallbackObs.length > 1) {
          observations = fallbackObs[1].trim();
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
    observations,
    status,
  };
}
