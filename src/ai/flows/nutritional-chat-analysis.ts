
'use server';
/**
 * @fileOverview A nutritional chat analysis AI agent.
 *
 * - nutritionalChatAnalysis - A function that handles the nutritional analysis process.
 * - NutritionalChatAnalysisInput - The input type for the nutritionalChatAnalysis function.
 * - NutritionalChatAnalysisOutput - The return type for the nutritionalChatAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalChatAnalysisInputSchema = z.object({
  mealDescription: z.string().describe('The description of the meals consumed during the day.'),
});
export type NutritionalChatAnalysisInput = z.infer<typeof NutritionalChatAnalysisInputSchema>;

const NutritionalChatAnalysisOutputSchema = z.object({
  analysis: z.string().describe('The nutritional analysis of the meals.'),
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
  prompt: `You are a nutrition expert. Your first and most important task is to detect the language of the user's input (it will be either English or Spanish). You MUST respond in the same language. All titles, units, and observations must be in the detected language.

Analyze the user's description of their meals for the day.

Your response must include:
1. A detailed breakdown of each meal (Breakfast, Lunch, Dinner, Snack) with its estimated calories, protein, fat, and carbohydrates.
2. A summary of the day's total calories, protein, fat, and carbs.
3. A brief "Observations" section with insights about the day's intake.
4. An analysis of whether the user mentioned taking "creatine" or "protein powder" and setting the 'creatineTaken' and 'proteinTaken' booleans in the output schema appropriately.

**IMPORTANT**: Structure your response EXACTLY like the example below, translating the titles and units to match the user's language.

**[Date] – Meal Log**

**Breakfast:** [description]
* [calories] kcal | [protein] g protein | [fat] g fat | [carbs] g carbohydrates

[Repeat for each meal]

**Totals for the day:**
* **Calories:** [total] kcal
* **Protein:** [total] g  
* **Fats:** [total] g
* **Carbohydrates:** [total] g

💡 **Observations:**
[Brief analysis comparing to user's goals]

User's Meal Description: {{{mealDescription}}} `,
});

const nutritionalChatAnalysisFlow = ai.defineFlow(
  {
    name: 'nutritionalChatAnalysisFlow',
    inputSchema: NutritionalChatAnalysisInputSchema,
    outputSchema: NutritionalChatAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
