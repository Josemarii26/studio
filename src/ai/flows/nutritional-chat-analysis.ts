
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
  prompt: `You are a bilingual nutrition expert, fluent in English and Spanish. Your primary task is to analyze a user's meal description and respond in the SAME language as the user's input.

You MUST identify meals labeled with keywords.
- For English, use: "Breakfast", "Lunch", "Dinner", "Snack".
- For Spanish, use: "Desayuno", "Almuerzo", "Cena", "Merienda".

If the user's description does not contain at least one of these keywords (in either language), you must respond with an error message in the user's language, stating that you couldn't find any meals and that they should label them clearly.

Your response must include:
1.  A detailed breakdown of each meal with its estimated calories, protein, fat, and carbohydrates.
2.  A summary of the day's total calories, protein, fat, and carbs.
3.  A brief "Observations" ("Observaciones" in Spanish) section with insights about the day's intake.
4.  An analysis of whether the user mentioned taking "creatine" ("creatina" in Spanish) or "protein powder" ("proteína en polvo" in Spanish) and setting the 'creatineTaken' and 'proteinTaken' booleans in the output schema appropriately.

**IMPORTANT**: Structure your response EXACTLY like the example below, using the user's language for all titles and units.

**[Date] – Meal Log / Registro de Comidas**

**Breakfast / Desayuno:** [description]
* [calories] kcal | [protein] g protein / proteína | [fat] g fat / grasa | [carbs] g carbohydrates / carbohidratos

[Repeat for each meal]

**Totals for the day / Totales del día:**
* **Calories / Calorías:** [total] kcal
* **Protein / Proteína:** [total] g
* **Fats / Grasas:** [total] g
* **Carbohydrates / Carbohidratos:** [total] g

💡 **Observations / Observaciones:**
[Brief analysis in the user's language]

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
    return output!;
  }
);

