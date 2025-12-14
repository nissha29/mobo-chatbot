import express, { Router, Response } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth.middleware";
import { detectIntent, getIntentResponse } from "../services/nlp.service";
import { ApiResponse, ChatMessage, Intent } from "../types/index";
import {
  getDeals,
  getOrders,
  getPayment,
  extractPriceRange,
  extractOrderFilters
} from "../services/chatbotActions";

const BASE_URL = process.env.BASE_URL || `http://localhost:4000`;
const appRouter = Router();

appRouter.post("/chat", async (req: express.Request, res: Response<ApiResponse>) => {
  try {
    const { message, sessionId }: ChatMessage & { sessionId?: string } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
        error: "VALIDATION_ERROR"
      });
    }

    const intent: Intent = await detectIntent(message);
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let responseMessage: string;
    let responseData: any = { intent, sessionId: currentSessionId };

    switch (intent) {
      case "DEALS":
        try {
          const dealsUrl = `${BASE_URL}/api/app/deals?message=${encodeURIComponent(message)}`;

          const dealsResponse = await fetch(dealsUrl, {
            headers: {
              "Authorization": req.headers.authorization || ""
            }
          });
          const dealsResult = await dealsResponse.json() as ApiResponse;
          console.log(dealsResult);

          if (!dealsResponse.ok) {
            throw new Error(dealsResult.message || "Failed to fetch deals");
          }

          responseMessage = dealsResult.message || "Sorry, I couldn't fetch the deals right now.";
          if (dealsResult.data && typeof dealsResult.data === 'object') {
            responseData.deals = (dealsResult.data as any).deals || [];
            if ('priceRange' in dealsResult.data) {
              responseData.priceRange = (dealsResult.data as any).priceRange;
            }
          } else {
            responseData.deals = [];
          }
        } catch (error: any) {
          responseMessage = "Sorry, I couldn't fetch the deals right now. Please try again later.";
        }
        break;

      case "ORDERS":
        try {
          const ordersUrl = `${BASE_URL}/api/app/orders?message=${encodeURIComponent(message)}`;
          const ordersResponse = await fetch(ordersUrl, {
            headers: {
              "Authorization": req.headers.authorization || ""
            }
          });
          const ordersResult = await ordersResponse.json() as ApiResponse;

          if (!ordersResponse.ok) {
            throw new Error(ordersResult.message || "Failed to fetch orders");
          }

          responseMessage = ordersResult.message || "Sorry, I couldn't fetch your orders right now.";
          if (ordersResult.data && typeof ordersResult.data === 'object') {
            responseData.orders = (ordersResult.data as any).orders || [];
            if ('orderFilters' in ordersResult.data) {
              responseData.orderFilters = (ordersResult.data as any).orderFilters;
            }
          } else {
            responseData.orders = [];
          }
        } catch (error: any) {
          responseMessage = error.message || "Sorry, I couldn't fetch your orders. Please try again later.";
        }
        break;

      case "PAYMENT":
        try {
          const paymentsUrl = `${BASE_URL}/api/app/payments`;
          const paymentsResponse = await fetch(paymentsUrl, {
            headers: {
              "Authorization": req.headers.authorization || ""
            }
          });
          const paymentsResult = await paymentsResponse.json() as ApiResponse;

          if (!paymentsResponse.ok) {
            throw new Error(paymentsResult.message || "Failed to fetch payment status");
          }

          const payments = paymentsResult.data || [];
          if (payments.length === 0) {
            responseMessage = "You don't have any payment records yet.";
          } else {
            responseMessage = `Here are all your payment statuses:\n\n${payments.map((payment: any, index: number) => {
              const orderInfo = payment.orderDetails ? `\n  Order: ${payment.orderDetails.productName || 'N/A'}` : '';
              return `${index + 1}. Amount Paid: $${payment.amountPaid}\n  Pending Amount: $${payment.pendingAmount}\n  Status: ${payment.status}`;
            }).join("\n\n")}`;
          }
          responseData.payments = payments;
        } catch (error: any) {
          responseMessage = error.message || "Sorry, I couldn't fetch your payment status. Please try again later.";
        }
        break;

      case "SUPPORT":
        responseMessage = getIntentResponse(intent);
        break;

      case "THANKS":
        responseMessage = getIntentResponse(intent);
        break;

      case "GREETING":
        responseMessage = getIntentResponse(intent);
        break;

      case "OTHERS":
        responseMessage = getIntentResponse(intent);
        break;

      case "UNKNOWN":
      default:
        responseMessage = "I'm not sure I understand. Can you please clarify? You can ask about deals, orders, payments, or ask for help.";
        break;
    }

    res.json({
      success: true,
      message: responseMessage,
      data: responseData
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process chat message",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

appRouter.get("/deals", async (req, res: Response<ApiResponse>) => {
  try {
    const { message, minPrice, maxPrice } = req.query;

    let parsedMinPrice: number | undefined;
    let parsedMaxPrice: number | undefined;
    let priceRange: { minPrice?: number; maxPrice?: number } | null = null;

    if (message && typeof message === 'string') {
      priceRange = await extractPriceRange(message);
      parsedMinPrice = priceRange?.minPrice;
      parsedMaxPrice = priceRange?.maxPrice;
    } else {
      parsedMinPrice = minPrice ? parseFloat(minPrice as string) : undefined;
      parsedMaxPrice = maxPrice ? parseFloat(maxPrice as string) : undefined;

      if (minPrice && (isNaN(parsedMinPrice!) || parsedMinPrice! < 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid minPrice. Must be a valid positive number.",
          error: "VALIDATION_ERROR"
        });
      }

      if (maxPrice && (isNaN(parsedMaxPrice!) || parsedMaxPrice! < 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid maxPrice. Must be a valid positive number.",
          error: "VALIDATION_ERROR"
        });
      }
    }

    const dealsResult = await getDeals(parsedMinPrice, parsedMaxPrice);
    const deals = dealsResult.data || [];

    let dealsMessage = "Here are our latest deals! 🎉";
    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
      if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined) {
        dealsMessage = `Here are deals in the price range ₹${parsedMinPrice} - ₹${parsedMaxPrice}! 🎉`;
      } else if (parsedMinPrice !== undefined) {
        dealsMessage = `Here are deals above ₹${parsedMinPrice}! 🎉`;
      } else if (parsedMaxPrice !== undefined) {
        dealsMessage = `Here are deals under ₹${parsedMaxPrice}! 🎉`;
      }
    }

    let responseMessage: string;
    if (deals.length === 0) {
      if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
        if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined) {
          responseMessage = `No deals found in the price range ₹${parsedMinPrice} - ₹${parsedMaxPrice}.`;
        } else if (parsedMinPrice !== undefined) {
          responseMessage = `No deals found above ₹${parsedMinPrice}.`;
        } else if (parsedMaxPrice !== undefined) {
          responseMessage = `No deals found under ₹${parsedMaxPrice}.`;
        } else {
          responseMessage = "No deals available at the moment.";
        }
      } else {
        responseMessage = "No deals available at the moment.";
      }
    } else {
      responseMessage = `${dealsMessage}\n\n${deals.map((deal: any) =>
        `• ${deal.title} - ₹${deal.price}\n  ${deal.description}`
      ).join("\n\n")}`;
    }

    const responseData: any = { deals: deals };
    if (priceRange) {
      responseData.priceRange = priceRange;
    }

    res.json({
      success: true,
      message: responseMessage,
      data: responseData
    });
  } catch (error: any) {
    console.error("Get deals error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve deals",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

appRouter.get("/orders", async (req: AuthRequest, res: Response<ApiResponse>) => {
  try {
    const { message, status, startDate, endDate } = req.query;

    let parsedStatus: string | undefined;
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    let recentOnly: boolean | undefined;
    let orderFilters: { status?: string; thisMonthOnly?: boolean; recentOnly?: boolean } | null = null;

    if (message && typeof message === 'string') {
      orderFilters = await extractOrderFilters(message);
      parsedStatus = orderFilters?.status;
      recentOnly = orderFilters?.recentOnly;

      if (orderFilters?.thisMonthOnly) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); 
        parsedStartDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
        parsedEndDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      }

      if (!parsedStatus) {
        const lowerMessage = message.toLowerCase();
        const statusMatch = lowerMessage.match(/\b(shipped|cancelled|canceled|pending|delivered|confirmed)\b/);
        if (statusMatch) {
          const status = statusMatch[1].toLowerCase();
          const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
          if (status === "canceled") {
            parsedStatus = "cancelled";
          } else if (validStatuses.includes(status)) {
            parsedStatus = status;
          }
        }
      }

      if (!parsedStartDate && message.toLowerCase().includes("this month")) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); 
        parsedStartDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
        parsedEndDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      }
    } else {
      parsedStatus = status as string | undefined;
      parsedStartDate = startDate ? new Date(startDate as string) : undefined;
      parsedEndDate = endDate ? new Date(endDate as string) : undefined;

      if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate format. Use YYYY-MM-DD",
          error: "VALIDATION_ERROR"
        });
      }

      if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate format. Use YYYY-MM-DD",
          error: "VALIDATION_ERROR"
        });
      }
    }

    if (parsedStartDate) {
      parsedStartDate.setHours(0, 0, 0, 0);
    }
    if (parsedEndDate) {
      parsedEndDate.setHours(23, 59, 59, 999);
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        error: "UNAUTHORIZED"
      });
    }

    const ordersResult = await getOrders(parsedStatus, parsedStartDate, parsedEndDate, recentOnly);
    const orders = ordersResult.data || [];

    let responseMessage: string;
    if (orders.length === 0) {
      if (parsedStatus && parsedStartDate && parsedEndDate) {
        responseMessage = `You don't have any ${parsedStatus} orders this month. Would you like to browse our deals?`;
      } else if (parsedStatus) {
        responseMessage = `You don't have any ${parsedStatus} orders at the moment. Would you like to browse our deals?`;
      } else if (parsedStartDate && parsedEndDate) {
        responseMessage = "You don't have any orders this month. Would you like to browse our deals?";
      } else {
        responseMessage = "You don't have any orders yet. Would you like to browse our deals?";
      }
    } else {
      if (recentOnly) {
        responseMessage = `Here is your most recent order:\n\n${orders.map((order: any) =>
          `• ${order.productName} - Status: ${order.status}\n Date: ${new Date(order.createdAt).toLocaleDateString()}`
        ).join("\n\n")}`;
      } else if (parsedStatus && parsedStartDate && parsedEndDate) {
        const statusText = parsedStatus.charAt(0).toUpperCase() + parsedStatus.slice(1);
        responseMessage = `Here are your ${parsedStatus} orders from this month:\n\n${orders.map((order: any) =>
          `• ${order.productName} - Status: ${order.status}\n Date: ${new Date(order.createdAt).toLocaleDateString()}`
        ).join("\n\n")}`;
      } else if (parsedStatus) {
        const statusText = parsedStatus.charAt(0).toUpperCase() + parsedStatus.slice(1);
        responseMessage = `Here are your ${parsedStatus} orders:\n\n${orders.map((order: any) =>
          `• ${order.productName} - Status: ${order.status}\n Date: ${new Date(order.createdAt).toLocaleDateString()}`
        ).join("\n\n")}`;
      } else if (parsedStartDate && parsedEndDate) {
        responseMessage = `Here are your orders from this month:\n\n${orders.map((order: any) =>
          `• ${order.productName} - Status: ${order.status}\n Date: ${new Date(order.createdAt).toLocaleDateString()}`
        ).join("\n\n")}`;
      } else {
        responseMessage = `Here are your orders:\n\n${orders.map((order: any) =>
          `• ${order.productName} - Status: ${order.status}\n Date: ${new Date(order.createdAt).toLocaleDateString()}`
        ).join("\n\n")}`;
      }
    }

    const responseData: any = { orders: orders };
    if (orderFilters) {
      responseData.orderFilters = orderFilters;
    }
    if (recentOnly) {
      responseData.recentOnly = true;
    }

    res.json({
      success: true,
      message: responseMessage,
      data: responseData
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

appRouter.get("/payments", async (req: AuthRequest, res: Response<ApiResponse>) => {
  try {
    const result = await getPayment();
    res.json(result);
  } catch (error: any) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment status",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

export default appRouter;
