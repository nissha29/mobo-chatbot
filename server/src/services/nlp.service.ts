// Detects user intents from chat messages using Groq AI

import Groq from "groq-sdk";
import { Intent } from "../types/index";

// Detects intent 
export const detectIntent = async (message: string): Promise<Intent> => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY not found in environment variables. Falling back to UNKNOWN intent.");
      return "UNKNOWN";
    }

    const groq = new Groq({ apiKey });

    const prompt = `Analyze the user's message and determine their PRIMARY intent. If the message contains both a greeting AND an action request, prioritize the ACTION intent.

Available intents (in priority order):
1. DEALS: User wants to see deals, discounts, offers, promotions, or sales
2. ORDERS: User wants to check their orders, order history, order status, or track orders
3. PAYMENT: User wants to check payment status, payment history, bills, or invoices
4. SUPPORT: User needs help, support, assistance, has questions, problems, issues, or wants to contact support (keywords: help, support, assistance, problem, issue, question, contact, customer service)
5. THANKS: User is expressing gratitude, appreciation, or saying thank you (keywords: thanks, thank you, appreciate, grateful, etc.)
6. GREETING: User is ONLY greeting with no action request (hello, hi, hey, good morning, etc.)
7. OTHERS: User's message doesn't fit into any specific category but is a general message or statement
8. UNKNOWN: If the message doesn't clearly match any of the above intents

CRITICAL RULES:
- If message contains action words (deals, orders, payment, help, support) even with a greeting, return the ACTION intent
- Examples: "hello, show me deals" → DEALS, "hi, I need help" → SUPPORT, "hey, check my orders" → ORDERS
- Only return GREETING if the message is purely a greeting with no action request
- Return THANKS for expressions of gratitude (thanks, thank you, appreciate, etc.)
- Return OTHERS for general messages that don't fit other categories

User message: "${message}"

Respond with ONLY the intent name (one word: DEALS, ORDERS, PAYMENT, SUPPORT, THANKS, GREETING, OTHERS, or UNKNOWN).`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an intent detection system. When a message contains both a greeting and an action request, ALWAYS prioritize the action intent (DEALS, ORDERS, PAYMENT, SUPPORT) over GREETING. Only return GREETING if the message is purely a greeting with no action. Return THANKS for expressions of gratitude. Return OTHERS for general messages. Always respond with only one word: DEALS, ORDERS, PAYMENT, SUPPORT, THANKS, GREETING, OTHERS, or UNKNOWN."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 10
    });

    const intentText = completion.choices[0]?.message?.content?.trim().toUpperCase() || "";
    const validIntents: Intent[] = ["DEALS", "ORDERS", "PAYMENT", "SUPPORT", "THANKS", "GREETING", "OTHERS", "UNKNOWN"];

    if (validIntents.includes(intentText as Intent)) {
      return intentText as Intent;
    }

    for (const intent of validIntents) {
      if (intentText.includes(intent)) {
        return intent;
      }
    }

    console.warn(`Groq returned unexpected intent: "${intentText}". Defaulting to UNKNOWN.`);
    return "UNKNOWN";
  } catch (error) {
    console.error("Error detecting intent with Groq:", error);
    return "UNKNOWN";
  }
};

// Get intent response
export const getIntentResponse = (intent: Intent): string => {
  const responses: Record<Intent, string> = {
    DEALS: "I'll show you the latest deals!",
    ORDERS: "Let me fetch your order history.",
    PAYMENT: "I'll check your payment status.",
    SUPPORT: "I'm here to help! What can I assist you with? You can ask about deals, orders, payments, or any other questions you have.",
    THANKS: "You're welcome! I'm happy to help. Is there anything else you'd like to know?",
    GREETING: "Hello! How can I help you today?",
    OTHERS: "I understand. How can I assist you today? You can ask about deals, orders, payments, or anything else you need help with.",
    UNKNOWN: "I'm not sure I understand. Can you rephrase? Try asking about deals, orders, payments, or ask for help."
  };

  return responses[intent];
};

