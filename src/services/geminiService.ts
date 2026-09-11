import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getFinancialInsights(data: any) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this financial data and provide 3 actionable insights: ${JSON.stringify(data)}. Return as JSON array of strings.`,
    config: { responseMimeType: "application/json" }
  });
  const result = await model;
  return JSON.parse(result.text || "[]");
}

export async function getHabitSuggestions(situation: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this financial situation: "${situation}", suggest 4 daily financial habits, each corresponding to one of the 4 pillars of Atomic Habits:
    1. Make it Obvious (Cue)
    2. Make it Attractive (Craving)
    3. Make it Easy (Response)
    4. Make it Satisfying (Reward)
    
    Return as a JSON object with a "message" string (intro) and a "habits" array of objects with {title, description, pillar}.`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are an expert wealth coach specializing in behavioral psychology and Atomic Habits. Your goal is to help users build wealth through small, consistent actions."
    }
  });
  const result = await model;
  return JSON.parse(result.text || "{}");
}

export async function getEnneagramAdvice(type: string, question: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a wealth coach specializing in the Enneagram. The user is a "${type}". Answer their question: "${question}". Keep it concise and empowering.`,
  });
  const result = await model;
  return result.text;
}

export async function getMoneyStoryAdvice(story: string, question: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Money Story Coach. The user has shared their money story: "${story}". 
    Answer their question: "${question}". 
    Help them explore their beliefs and rewrite their financial narrative. 
    Be empathetic, insightful, and empowering.`,
  });
  const result = await model;
  return result.text;
}

export async function getGoalBrainstorming(dream: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user has this dream: "${dream}". 
    Help them turn it into a structured goal using Zig Ziglar's 7-step goal setting process:
    1. Write it down (The Goal)
    2. Put a date on it (The Deadline)
    3. List the obstacles you will have to overcome
    4. Identify the people and groups you will need to work with
    5. Identify what you need to know (Skills/Knowledge)
    6. Develop a plan of action
    7. Write down "Why" you want to achieve the goal (The Motivation)
    
    Return as a JSON object with:
    - "message": a summary intro
    - "habits": an array of 7 objects with {title, description, pillar} where pillar is the step name
    - "suggestedGoal": an object with {title, targetAmount, deadline, category, obstacles, partners, knowledge, plan, why} where category is one of "1-year", "3-year", "5-year" based on the dream.
    The obstacles, partners, knowledge, plan, and why fields should be concise summaries based on the 7-step analysis.`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are a world-class performance coach specializing in Zig Ziglar's goal-setting methodology. Your goal is to help users transform vague dreams into concrete, actionable, and emotionally-charged financial goals."
    }
  });
  const result = await model;
  return JSON.parse(result.text || "{}");
}

export async function classifyRawCsv(csvText: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse and classify these bank transactions from the following raw CSV data. 
    Identify the date, description, and amount for each transaction. 
    Classify each into categories (e.g., Groceries, Rent, Salary, Entertainment, Utilities, Transport, Healthcare, Shopping, Dining Out, Other). 
    Determine if each is an 'income' or 'expense'.
    
    Raw CSV Data:
    """
    ${csvText}
    """
    
    Return as a JSON array of objects with {date, amount, category, description, type}. 
    Ensure:
    - 'amount' is a positive number.
    - 'type' is either 'income' or 'expense'.
    - 'date' is in YYYY-MM-DD format.
    - 'category' is a sensible financial category.
    - 'description' is the original payee/memo from the CSV.`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are a precise financial analyst. Your task is to parse raw CSV bank statements and categorize transactions accurately. You must output ONLY a valid JSON array of objects."
    }
  });
  const result = await model;
  return JSON.parse(result.text || "[]");
}

export async function classifyTransactions(transactions: { date: string, description: string, amount: number }[]) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Classify these bank transactions into categories (e.g., Groceries, Rent, Salary, Entertainment, Utilities, Transport, Healthcare, Shopping, Dining Out, Other). 
    Also determine if each is an 'income' or 'expense'. Usually, negative amounts are expenses and positive are income, but use the description to be sure.
    Transactions: ${JSON.stringify(transactions)}.
    Return as a JSON array of objects with {date, amount, category, description, type}. 
    Ensure the 'amount' is a positive number in the output, and 'type' correctly identifies it as 'income' or 'expense'.
    The 'date' should be in YYYY-MM-DD format.`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are a precise financial analyst. Your task is to categorize bank transactions accurately based on their descriptions and amounts."
    }
  });
  const result = await model;
  return JSON.parse(result.text || "[]");
}

export async function analyzeProfilePhoto(base64Image: string, mimeType: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        {
          text: `You are a world-class personal branding and wealth psychology expert. 
          Analyze this profile photo for a high-ticket coaching and wealth management app.
          
          Provide:
          1. A "Wealth Persona" name (e.g., "The Visionary Architect", "The Grounded Strategist").
          2. A brief analysis of what this photo communicates about their relationship with wealth and success.
          3. Three actionable tips to improve their personal brand through their profile photo.
          
          Output ONLY valid JSON in this format:
          {
            "persona": "...",
            "analysis": "...",
            "tips": ["...", "...", "..."]
          }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });
  const result = await model;
  return JSON.parse(result.text || "{}");
}
