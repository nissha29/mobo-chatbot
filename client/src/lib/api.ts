const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RegisterData {
    name: string;
    phone: string;
    address: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UserData {
    userId: string;
    name: string;
    phone: string;
    address: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: UserData;
        token: string;
    };
    error?: string;
}

export interface Deal {
    dealId: string;
    title: string;
    description: string;
    price: number;
    imageURL: string;
}

export interface Order {
    orderId: string;
    productName: string;
    imageURL: string;
    status: string;
    createdAt: string;
}

export interface Payment {
    paymentId: string;
    orderId: string;
    orderDetails?: {
        productName?: string;
        imageURL?: string;
        status?: string;
    };
    amountPaid: number;
    pendingAmount: number;
    status: string;
    createdAt: string;
}

export interface ChatResponse {
    success: boolean;
    message: string;
    data?: {
        intent?: string;
        sessionId?: string;
        deals?: Deal[];
        orders?: Order[];
        payments?: Payment[];
        payment?: any;
        requiresAuth?: boolean;
    };
    error?: string;
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data?: {
        orders: Order[];
        orderFilters?: any;
        recentOnly?: boolean;
    };
    error?: string;
}

// Register a new user
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please check if the server is running on ${API_BASE_URL}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Registration failed");
        }

        return result;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Registration failed",
            error: error.message,
        };
    }
}

// Login user
export async function loginUser(data: LoginData): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please check if the server is running on ${API_BASE_URL}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        return result;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Login failed",
            error: error.message,
        };
    }
}

// Store auth token
export function setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
    }
}

// Get auth token
export function getAuthToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
}

// Store user data
export function setUserData(user: UserData): void {
    if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(user));
    }
}

// Get user data
export function getUserData(): UserData | null {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem("userData");
        return data ? JSON.parse(data) : null;
    }
    return null;
}

// Send chat message
export async function sendChatMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/app/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ message, sessionId }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            await response.text();
            throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please check if the server is running on ${API_BASE_URL}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to send message");
        }

        return result;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to send message",
            error: error.message,
        };
    }
}

// Fetch orders
export async function fetchOrders(status?: string): Promise<OrdersResponse> {
    try {
        const token = getAuthToken();
        const url = new URL(`${API_BASE_URL}/api/app/orders`);
        if (status) {
            url.searchParams.append("status", status);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please check if the server is running on ${API_BASE_URL}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to fetch orders");
        }

        return result;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch orders",
            error: error.message,
        };
    }
}
