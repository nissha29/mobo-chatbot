// API call functions for chatbot actions based on detected intent

import Groq from "groq-sdk";
import { Deal, Order, Payment } from "../models/index";

// Extract price range info
export const extractPriceRange = async (message: string): Promise<{ minPrice?: number; maxPrice?: number } | null> => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return null;
    }

    const groq = new Groq({ apiKey });

    const prompt = `Extract price range information from the following message. The user may mention:
- A minimum price (e.g., "above 1000", "more than 500", "at least 2000", "over 1500", "greater than 800")
- A maximum price (e.g., "below 5000", "less than 3000", "under 1000", "up to 2000", "maximum 4000")
- A price range (e.g., "between 1000 and 5000", "from 500 to 2000", "1000-5000")
- A single price point (e.g., "around 2000", "about 1500")

User message: "${message}"

CRITICAL: Return ONLY a valid JSON object. Do NOT write code, functions, or explanations. Return ONLY this format:
{"minPrice": number or null, "maxPrice": number or null}

IMPORTANT PRICE EXTRACTION RULES (READ CAREFULLY):
- MAXIMUM PRICE (user wants deals BELOW/UNDER a price):
  * "below X", "under X", "less than X", "up to X", "maximum X" → Set maxPrice to X, minPrice to null
  * Example: "deals below 1000" → {"minPrice": null, "maxPrice": 1000}
  * Example: "show me deals under 500" → {"minPrice": null, "maxPrice": 500}
  
- MINIMUM PRICE (user wants deals ABOVE/OVER a price):
  * "above X", "more than X", "at least X", "over X", "greater than X" → Set minPrice to X, maxPrice to null
  * Example: "deals above 1000" → {"minPrice": 1000, "maxPrice": null}
  * Example: "show me deals over 500" → {"minPrice": 500, "maxPrice": null}
  
- PRICE RANGE (user wants deals BETWEEN two prices):
  * "between X and Y", "from X to Y", "X-Y" → Set minPrice to smaller value, maxPrice to larger value
  * Example: "deals between 500 and 1000" → {"minPrice": 500, "maxPrice": 1000}
  
- If no price information is found, return: {"minPrice": null, "maxPrice": null}

CRITICAL: Do NOT confuse "below/under" with "above/over". "Below" means maximum price (price <= X), "Above" means minimum price (price >= X).

Extract numeric values only, ignore currency symbols.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a JSON-only response system. Extract price range information from user messages. CRITICAL RULES: 'below', 'under', 'less than', 'up to' indicate MAXIMUM price (set maxPrice, minPrice=null). 'above', 'over', 'more than', 'at least' indicate MINIMUM price (set minPrice, maxPrice=null). Return ONLY valid JSON in the format {\"minPrice\": number or null, \"maxPrice\": number or null}. Never write code or explanations, only JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 100
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "";

    let extractedData: any;
    try {
      let cleanedText = responseText;
      cleanedText = cleanedText.replace(/```[a-z]*\n?/gi, '');
      cleanedText = cleanedText.replace(/```/g, '');

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(cleanedText);
      }
    } catch (parseError) {
      console.error("Failed to parse Groq response as JSON:", responseText);
      return null;
    }

    if (!extractedData || typeof extractedData !== "object") {
      return null;
    }

    const priceRange: { minPrice?: number; maxPrice?: number } = {};

    if (extractedData.minPrice !== null && extractedData.minPrice !== undefined) {
      const minPrice = parseFloat(extractedData.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) {
        priceRange.minPrice = minPrice;
      }
    }

    if (extractedData.maxPrice !== null && extractedData.maxPrice !== undefined) {
      const maxPrice = parseFloat(extractedData.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        priceRange.maxPrice = maxPrice;
      }
    }

    if (!priceRange.minPrice && !priceRange.maxPrice) {
      return null;
    }

    return priceRange;
  } catch (error: any) {
    console.error("Error extracting price range:", error);
    return null;
  }
};

//Get deals from the database
export const getDeals = async (minPrice?: number, maxPrice?: number): Promise<any> => {
  try {
    const query: any = {};

    if ((minPrice !== undefined && minPrice !== null) || (maxPrice !== undefined && maxPrice !== null)) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== null) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined && maxPrice !== null) {
        query.price.$lte = maxPrice;
      }
    }

    const deals = await Deal.find(query).sort({ createdAt: -1 });

    return {
      success: true,
      message: "Deals retrieved successfully",
      data: deals.map(deal => ({
        dealId: deal._id.toString(),
        title: deal.title,
        description: deal.description,
        price: deal.price,
        imageURL: deal.imageURL
      }))
    };
  } catch (error: any) {
    console.error("Error fetching deals:", error);
    throw new Error(error.message || "Failed to fetch deals");
  }
};

// Extract order filtering info
export const extractOrderFilters = async (message: string): Promise<{ status?: string; thisMonthOnly?: boolean; recentOnly?: boolean } | null> => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return null;
    }

    const groq = new Groq({ apiKey });

    const prompt = `Extract order filtering information from the following message. The user may ask for:
- "order" or "my orders" or "orders" → return all null (no filters)
- "my past orders" or "past orders" → return all null (no filters, get all orders)
- "my recent order" or "recent order" → return {"recentOnly": true} (get only the most recent order)
- "my this month orders" or "this month orders" or "orders this month" → return {"thisMonthOnly": true}
- Order status filters: "pending orders", "confirmed orders", "shipped orders", "delivered orders", "cancelled orders" → return {"status": "pending"|"confirmed"|"shipped"|"delivered"|"cancelled"}
- COMBINATIONS: "pending orders this month", "this month pending orders", "shipped orders this month" → return BOTH status AND thisMonthOnly

User message: "${message}"

CRITICAL: Return ONLY a valid JSON object. Do NOT write code, functions, or explanations. Return ONLY this format:
{
  "status": "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | null,
  "thisMonthOnly": true | null,
  "recentOnly": true | null
}

Rules:
- "order", "my orders", "orders", "my past orders", "past orders" → {"status": null, "thisMonthOnly": null, "recentOnly": null}
- "my recent order", "recent order" → {"status": null, "thisMonthOnly": null, "recentOnly": true}
- "my this month orders", "this month orders", "orders this month" → {"status": null, "thisMonthOnly": true, "recentOnly": null}
- "pending orders", "my pending orders" → {"status": "pending", "thisMonthOnly": null, "recentOnly": null}
- "confirmed orders", "my confirmed orders" → {"status": "confirmed", "thisMonthOnly": null, "recentOnly": null}
- "shipped orders", "my shipped orders" → {"status": "shipped", "thisMonthOnly": null, "recentOnly": null}
- "delivered orders", "my delivered orders" → {"status": "delivered", "thisMonthOnly": null, "recentOnly": null}
- "cancelled orders", "my cancelled orders" → {"status": "cancelled", "thisMonthOnly": null, "recentOnly": null}
- "pending orders this month", "this month pending orders" → {"status": "pending", "thisMonthOnly": true, "recentOnly": null}
- "shipped orders this month", "this month shipped orders" → {"status": "shipped", "thisMonthOnly": true, "recentOnly": null}
- Similar combinations for other statuses with "this month"

If the message doesn't match any of these patterns, return all null.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a JSON-only response system. Extract order filtering from user messages including status, date range, and recent flag. Return ONLY valid JSON in the format {\"status\": \"pending\"|\"confirmed\"|\"shipped\"|\"delivered\"|\"cancelled\" or null, \"startDate\": \"YYYY-MM-DD\" or null, \"endDate\": \"YYYY-MM-DD\" or null, \"recentOnly\": true or null}. Never write code or explanations, only JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 100
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "";

    let extractedData: any;
    try {
      let cleanedText = responseText;
      cleanedText = cleanedText.replace(/```[a-z]*\n?/gi, '');
      cleanedText = cleanedText.replace(/```/g, '');

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(cleanedText);
      }
      console.log("Extracted data:", extractedData);
      return extractedData;
    } catch (parseError) {
      console.error("Failed to parse Groq response as JSON:", responseText);
      return null;
    }
  } catch (error: any) {
    console.error("Error extracting order filters:", error);
    return null;
  }
};

export const getOrders = async (status?: string, startDate?: Date, endDate?: Date, recentOnly?: boolean): Promise<any> => {
  try {
    const query: any = {};

    if (status) {
      const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
      if (validStatuses.includes(status.toLowerCase())) {
        query.status = status.toLowerCase();
      }
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    let orders;
    if (recentOnly) {
      orders = await Order.find(query).sort({ createdAt: -1 }).limit(1);
    } else {
      orders = await Order.find(query).sort({ createdAt: -1 });
    }

    return {
      success: true,
      message: "Orders retrieved successfully",
      data: orders.map(order => ({
        orderId: order._id.toString(),
        userId: order.userId.toString(),
        productName: order.productName,
        imageURL: order.imageURL,
        status: order.status,
        createdAt: order.createdAt
      }))
    };
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    throw new Error(error.message || "Failed to fetch orders");
  }
};

// Get user payment status
export const getPayment = async (): Promise<any> => {
  try {
    const payments = await Payment.find({ })
      .populate("orderId", "productName imageURL status")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Payment status retrieved successfully",
      data: payments.map(payment => ({
        paymentId: payment._id.toString(),
        orderId: payment.orderId.toString(),
        orderDetails: payment.orderId,
        amountPaid: payment.amountPaid,
        pendingAmount: payment.pendingAmount,
        status: payment.pendingAmount > 0 ? "pending" : "completed",
        createdAt: payment.createdAt
      }))
    };
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    throw new Error(error.message || "Failed to fetch payment status");
  }
};

