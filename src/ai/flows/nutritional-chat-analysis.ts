
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
  prompt: `Analyze this description of meals. Also, check if the user mentions taking "creatine" or "protein powder" and set the creatineTaken and proteinTaken booleans appropriately. Return EXACTLY this format:

**📅 [Fecha] – Registro de comidas**

**Desayuno:** [descripción]
* [calorías] kcal | [proteínas] g proteína | [grasas] g grasa | [carbohidratos] g carbohidratos

[Repetir para cada comida]

**🔢 Totales del día:**
* **Calorías:** [total] kcal
* **Proteínas:** [total] g  
* **Grasas:** [total] g
* **Carbohidratos:** [total] g

💡 **Observaciones:**
[Análisis breve comparado con objetivos del usuario]

Meals Description: {{{mealDescription}}} `,
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
