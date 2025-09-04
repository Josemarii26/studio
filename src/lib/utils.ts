
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

  // Regex for English and Spanish, with optional bolding
  const mealRegex = /^\*?\*?(\w+):\*?\*? (.*?)$/i;
  const nutritionRegex = /^\* ([\d,.]+) kcal \| ([\d,.]+) g (?:proteína|protein) \| ([\d,.]+) g (?:grasa|fat) \| ([\d,.]+) g (?:carbohidratos|carbohydrates)/i;
  const totalCaloriesRegex = /^\* \**Calor(?:ías|ies):\** ([\d,.]+) kcal/i;
  const totalProteinRegex = /^\* \**Prote(?:ínas|in):\** ([\d,.]+) g/i;
  const totalFatRegex = /^\* \**(?:Grasas|Fats):\** ([\d,.]+) g/i;
  const totalCarbsRegex = /^\* \**Carbohidratos|Carbohydrates:\** ([\d,.]+) g/i;
  const observationRegex = /^💡 \**Observa(?:ciones|tions):\**\n?([\s\S]*)$/im;
  
  let currentMealType: keyof DayData['meals'] | null = null;
  let inTotalsSection = false;
  let inObservationSection = false;
  let observationLines: string[] = [];

  for (const line of lines) {
    if (inObservationSection) {
        observationLines.push(line);
        continue;
    }

    const obsMatch = line.match(/^💡 \**Observa(?:ciones|tions):\**/i);
    if (obsMatch) {
      inObservationSection = true;
      const contentAfterTitle = analysisText.split(line)[1];
      if (contentAfterTitle) {
          observations = contentAfterTitle.trim();
          break; 
      }
      continue;
    }

    if (/^(?:🔢 Totales del día:|Totals for the day:)/.test(line)) {
        inTotalsSection = true;
        currentMealType = null;
        continue;
    }
    
    if(inTotalsSection) {
        const calMatch = line.match(totalCaloriesRegex);
        if (calMatch) totals.calories = parseFloat(calMatch[1].replace(/,/g, ''));
        const protMatch = line.match(totalProteinRegex);
        if (protMatch) totals.protein = parseFloat(protMatch[1].replace(/,/g, ''));
        const fatMatch = line.match(totalFatRegex);
        if (fatMatch) totals.fat = parseFloat(fatMatch[1].replace(/,/g, ''));
        const carbMatch = line.match(totalCarbsRegex);
        if (carbMatch) totals.carbs = parseFloat(carbMatch[1].replace(/,/g, ''));
        continue;
    }
    
    const mealMatch = line.match(mealRegex);
    if (mealMatch) {
        inTotalsSection = false;
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

  if (observationLines.length > 0) {
      observations = observationLines.join('\n').trim();
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
