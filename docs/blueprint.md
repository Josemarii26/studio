# **App Name**: NutriTrackAI

## Core Features:

- Initial Onboarding: Collect user's personal and physical data (name, age, gender, weight, height, activity level, goals) and automatically calculate BMI and daily recommended calories.
- Calorie Deficit Identification Tool: Dashboard calendar view showing daily calorie status: green (on target), yellow (moderate deviation), red (significant deviation). Color coding should depend on thresholds provided on initial onboarding.
- Nutritional Chat Interface: Modern chat interface that sends meal descriptions to OpenAI API for nutritional analysis. The prompt analyzes meal descriptions and returns structured data including calories, protein, fats, carbohydrates, and a brief analysis compared to user goals.
- Detailed Day View: Clicking a day on the calendar opens a modal or dedicated page with the complete nutritional analysis, macronutrient pie charts, comparison with personal goals, and options to edit or add meals.
- Progress Panel: Displays weekly/monthly trend graphs for user-tracked data, and calculates streaks (number of days where target is hit).

## Style Guidelines:

- Primary color: Healthy Green (#4CAF50), evoking a sense of health and well-being, deviating slightly from Airbnb's coral.
- Background color: Very light green (#F1F8E9), providing a soft, neutral backdrop.
- Accent color: A slightly brighter yellow-green (#8BC34A) to guide the user through the application.
- Font: 'PT Sans', a humanist sans-serif font suitable for headlines and body text.
- Use Material Design or Feather Icons to keep the visuals crisp and informative.
- Employ a generous use of white space and soft shadows to create a clean, airy, Airbnb-inspired layout. Use rounded corners (border-radius: 12px) for cards and elements.
- Incorporate smooth transitions (0.3s ease) for a polished user experience.