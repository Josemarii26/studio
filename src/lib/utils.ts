
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
  const lines = analysisText.split('\n');

  const meals: DayData['meals'] = {};
  const totals: DayData['totals'] = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  let observations = '';

  // Regex for English and Spanish, with optional bolding and multi-line flexibility
  const mealRegex = /^\*?\*?(\w+):\*?\*? (.*?)$/i;
  const nutritionRegex = /^\* ([\d,.]+) kcal \| ([\d,.]+) g (?:proteína|protein) \| ([\d,.]+) g (?:grasa|fat) \| ([\d,.]+) g (?:carbohidratos|carbohydrates)/i;
  const totalCaloriesRegex = /Calor(?:ías|ies):[\s\n]*([\d,.]+) kcal/i;
  const totalProteinRegex = /Prote(?:ínas|in):[\s\n]*([\d,.]+) g/i;
  const totalFatRegex = /(?:Grasas|Fats):[\s\n]*([\d,.]+) g/i;
  const totalCarbsRegex = /(?:Carbohidratos|Carbohydrates):[\s\n]*([\d,.]+) g/i;

  let currentMealType: keyof DayData['meals'] | null = null;
  let inTotalsSection = false;

  const observationMatch = analysisText.match(/💡 \**Observa(?:ciones|tions):\**\n?([\s\S]*)/im);
  if (observationMatch) {
    observations = observationMatch[1].trim();
  }
  
  const totalSectionMatch = analysisText.match(/(?: Totales del día:|Totals for the day:)[\s\S]*/i);

  if (totalSectionMatch) {
      const totalBlock = totalSectionMatch[0];
      const calMatch = totalBlock.match(totalCaloriesRegex);
      if (calMatch) totals.calories = parseFloat(calMatch[1].replace(/,/g, ''));
      
      const protMatch = totalBlock.match(totalProteinRegex);
      if (protMatch) totals.protein = parseFloat(protMatch[1].replace(/,/g, ''));

      const fatMatch = totalBlock.match(totalFatRegex);
      if (fatMatch) totals.fat = parseFloat(fatMatch[1].replace(/,/g, ''));

      const carbMatch = totalBlock.match(totalCarbsRegex);
      if (carbMatch) totals.carbs = parseFloat(carbMatch[1].replace(/,/g, ''));
  }


  for (const line of lines) {
    if (/^(?:🔢 Totales del día:|Totals for the day:)/.test(line)) {
        break; // Stop processing meals when totals section is reached
    }

    const mealMatch = line.match(mealRegex);
    if (mealMatch) {
        const mealTypeStr = mealMatch[1].toLowerCase();
        const mealTypeMap: { [key: string]: keyof DayData['meals'] } = {
            desayuno: 'breakfast', breakfast: 'breakfast',
            almuerzo: 'lunch', lunch: 'lunch',
            merienda: 'snack', snack: 'snack',
            cena: 'dinner', dinner: 'dinner',
        };
        const mappedType = mealTypeMap[mealTypeStr];
        if (mappedType) {
            currentMealType = mappedType;
            meals[currentMealType] = {
                description: mealMatch[2],
                calories: 0, protein: 0, fat: 0, carbs: 0,
            };
        }
        continue;
    }
    
    const nutritionMatch = line.match(nutritionRegex);
    if (nutritionMatch && currentMealType && meals[currentMealType]) {
        meals[currentMealType]!.calories = parseFloat(nutritionMatch[1].replace(/,/g, ''));
        meals[currentMealType]!.protein = parseFloat(nutritionMatch[2].replace(/,/g, ''));
        meals[currentMealType]!.fat = parseFloat(nutritionMatch[3].replace(/,/g, ''));
        meals[currentMealType]!.carbs = parseFloat(nutritionMatch[4].replace(/,/g, ''));
        currentMealType = null;
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
