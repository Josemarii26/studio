'use server';
/**
 * @fileOverview A nutritional chat analysis AI agent that uses structured output.
 *
 * - nutritionalChatAnalysis - A function that handles the nutritional analysis process.
 * - NutritionalChatAnalysisInput - The input type for the nutritionalChatAnalysis function.
 * - NutritionalChatAnalysisOutput - The return type for the nutritionalChatAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalChatAnalysisInputSchema = z.object({
  mealDescription: z.string().describe('The description of the meals consumed during the day.'),
  currentDate: z.string().describe('The date for which the user is logging meals, in YYYY-MM-DD format.'),
});
export type NutritionalChatAnalysisInput = z.infer<typeof NutritionalChatAnalysisInputSchema>;

const MealSchema = z.object({
    description: z.string().describe("The user's description of this specific meal."),
    calories: z.number().describe('The estimated calories for this meal.'),
    protein: z.number().describe('The estimated protein in grams for this meal.'),
    fat: z.number().describe('The estimated fat in grams for this meal.'),
    carbs: z.number().describe('The estimated carbohydrates in grams for this meal.'),
});

const NutritionalChatAnalysisOutputSchema = z.object({
  date: z.string().describe("The date for which the meals are being logged, in YYY-MM-DD format. This MUST be the same as the `currentDate` provided in the input."),
  meals: z.object({
    breakfast: MealSchema.optional().describe('The analysis for the breakfast meal, if present.'),
    lunch: MealSchema.optional().describe('The analysis for the lunch meal, if present.'),
    dinner: MealSchema.optional().describe('The analysis for the dinner meal, if present.'),
    merienda: MealSchema.optional().describe('The analysis for the snack/merienda, if present.'),
  }),
  totals: z.object({
    calories: z.number().describe('The total summed calories for all meals.'),
    protein: z.number().describe('The total summed protein for all meals.'),
    fat: z.number().describe('The total summed fat for all meals.'),
    carbs: z.number().describe('The total summed carbs for all meals.'),
  }),
  observations: z.string().describe("A brief analysis and observations about the user's intake for the day, written in the user's language."),
  creatineTaken: z.boolean().describe('Whether the user mentioned taking creatine.'),
  proteinTaken: z.boolean().describe('Whether the user mentioned taking protein powder.'),
});
export type NutritionalChatAnalysisOutput = z.infer<typeof NutritionalChatAnalysisOutputSchema>;


export async function nutritionalChatAnalysis(
  input: NutritionalChatAnalysisInput
): Promise<NutritionalChatAnalysisOutput> {
  return nutritionalChatAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionalChatAnalysisPrompt',
  input: {schema: NutritionalChatAnalysisInputSchema},
  output: {schema: NutritionalChatAnalysisOutputSchema},
  prompt: `You are a bilingual nutrition expert, fluent in English and Spanish. Your task is to analyze a user's meal description and respond with a structured JSON object.

- You MUST respond in the SAME language as the user's input for any free-text fields like 'observations'.
- The user is logging meals for the date: {{currentDate}}. You MUST set the 'date' field in your response to this exact value.
- You MUST identify meals based on keywords and place them in the correct field in the output schema.
  - English keywords: "Breakfast", "Lunch", "Dinner", "Snack".
  - Spanish keywords: "Desayuno", "Desayunar", "Almuerzo", "Almorzar", "Cena", "Cenar", "Merienda", "Merendar".
- The 'merienda' field in the JSON output corresponds to the "Snack" keyword in English. If a meal is described but doesn't have a clear keyword, use context to place it correctly.

Your task is to:
1.  Analyze the user's meal description.
2.  Calculate the estimated calories, protein, fat, and carbohydrates for EACH meal.
3.  Calculate the TOTALS for the entire day by summing the macronutrients of all individual meals.
4.  Provide brief "Observations" ("Observaciones" in Spanish) with insights about the day's intake.
5.  Determine if the user mentioned taking "creatine" ("creatina" in Spanish) or "protein powder" ("proteína en polvo" in Spanish) and set the booleans accordingly.
6.  Populate the JSON output, ensuring the 'date' field is set to {{currentDate}}.

User's Meal Description: {{{mealDescription}}}`,
});

const nutritionalChatAnalysisFlow = ai.defineFlow(
  {
    name: 'nutritionalChatAnalysisFlow',
    inputSchema: NutritionalChatAnalysisInputSchema,
    outputSchema: NutritionalChatAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a structured response.");
    }
    return output;
  }
);
