import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bmi } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "underweight";
    else if (bmi < 25) bmiCategory = "normal weight";
    else if (bmi < 30) bmiCategory = "overweight";
    else bmiCategory = "obese";

    const prompt = `Based on a BMI of ${bmi} (${bmiCategory}), provide personalized nutrition recommendations. Include:
1. Daily calorie target
2. Macronutrient breakdown (protein, carbs, fats in grams)
3. List of 5 recommended foods with their nutritional benefits
4. 3 foods to avoid or limit
5. 2 healthy meal suggestions

Format the response as JSON with this structure:
{
  "dailyCalories": number,
  "macros": { "protein": number, "carbs": number, "fats": number },
  "recommendedFoods": [{ "name": string, "benefits": string }],
  "avoidFoods": [string],
  "mealSuggestions": [{ "name": string, "description": string }]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a nutrition expert AI. Provide accurate, helpful nutrition advice based on BMI. Always respond with valid JSON." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the AI response
    let nutritionData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default response if parsing fails
      nutritionData = {
        dailyCalories: bmi < 25 ? 2000 : 1800,
        macros: { protein: 100, carbs: 200, fats: 65 },
        recommendedFoods: [
          { name: "Lean Chicken", benefits: "High protein, low fat" },
          { name: "Quinoa", benefits: "Complete protein, fiber-rich" },
          { name: "Broccoli", benefits: "Vitamins, fiber, low calories" },
          { name: "Salmon", benefits: "Omega-3, protein" },
          { name: "Greek Yogurt", benefits: "Probiotics, protein" }
        ],
        avoidFoods: ["Processed snacks", "Sugary drinks", "Fried foods"],
        mealSuggestions: [
          { name: "Grilled Salmon Bowl", description: "Salmon with quinoa and roasted vegetables" },
          { name: "Greek Yogurt Parfait", description: "Yogurt with berries and nuts" }
        ]
      };
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-nutrition function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
