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
    const { bmi, gender } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "underweight";
    else if (bmi < 25) bmiCategory = "normal weight";
    else if (bmi < 30) bmiCategory = "overweight";
    else bmiCategory = "obese";

    const genderContext = gender ? `The user is ${gender}. Consider gender-specific nutritional needs such as:
- ${gender === 'female' ? 'Higher iron requirements, especially during menstruation' : 'Higher protein needs for muscle maintenance'}
- ${gender === 'female' ? 'Calcium needs for bone health' : 'Higher calorie baseline'}
- ${gender === 'female' ? 'Folate requirements' : 'Zinc for testosterone production'}` : '';

    const prompt = `Based on a BMI of ${bmi} (${bmiCategory})${gender ? ` for a ${gender} individual` : ''}, provide personalized nutrition recommendations. 
${genderContext}

Include:
1. Daily calorie target (adjusted for gender if specified)
2. Macronutrient breakdown (protein, carbs, fats in grams)
3. List of 5 recommended foods with their nutritional benefits and a relevant emoji icon
4. 3 foods to avoid or limit
5. 3 healthy meal suggestions with descriptions

Format the response as JSON with this structure:
{
  "dailyCalories": number,
  "macros": { "protein": number, "carbs": number, "fats": number },
  "recommendedFoods": [{ "name": string, "benefits": string, "icon": string, "imageUrl": string }],
  "avoidFoods": [string],
  "mealSuggestions": [{ "name": string, "description": string, "imageUrl": string }]
}

For imageUrl fields, use real Unsplash image URLs in this format: https://images.unsplash.com/photo-XXXXXXXX?w=400&h=300&fit=crop
Use actual food-related Unsplash photo IDs that match the food items. Examples:
- Chicken: https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop
- Salmon: https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop
- Broccoli: https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop
- Quinoa: https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop
- Greek Yogurt: https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop
- Eggs: https://images.unsplash.com/photo-1482049016gy-2f53bff25f4f?w=400&h=300&fit=crop
- Avocado: https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop
- Oatmeal: https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop
- Salad: https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop
- Grilled chicken bowl: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`;

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
          { name: "Lean Chicken", benefits: "High protein, low fat", icon: "🍗", imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop" },
          { name: "Quinoa", benefits: "Complete protein, fiber-rich", icon: "🌾", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" },
          { name: "Broccoli", benefits: "Vitamins, fiber, low calories", icon: "🥦", imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop" },
          { name: "Salmon", benefits: "Omega-3, protein", icon: "🐟", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop" },
          { name: "Greek Yogurt", benefits: "Probiotics, protein", icon: "🥛", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop" }
        ],
        avoidFoods: ["Processed snacks", "Sugary drinks", "Fried foods"],
        mealSuggestions: [
          { name: "Grilled Salmon Bowl", description: "Salmon with quinoa and roasted vegetables", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" },
          { name: "Greek Yogurt Parfait", description: "Yogurt with berries and nuts", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop" },
          { name: "Veggie Stir Fry", description: "Mixed vegetables with lean protein", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop" }
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
