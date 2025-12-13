export interface RegisterRequest {
  name: string;
  phone: string;
  address: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  phone: string;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ChatMessage {
  message: string;
  intent?: string;
}

export type Intent = "DEALS" | "ORDERS" | "PAYMENT" | "SUPPORT" | "GREETING" | "THANKS" | "OTHERS" | "UNKNOWN";

export interface Session {
  userId?: string;
  token?: string;
  data?: any;
}