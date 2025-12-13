"use client";

import Link from "next/link";
import { ArrowLeft, BotMessageSquare, Flame, Package, CreditCard, MessageSquare, Mic, Send, ShoppingBag, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getUserData, sendChatMessage, Deal, Order, Payment, fetchOrders } from "@/src/lib/api";
import DealCard from "@/src/components/DealCard";
import OrderCard from "@/src/components/OrderCard";
import PaymentCard from "@/src/components/PaymentCard";

type Message = {
    id: number;
    text: string;
    sender: "bot" | "user";
    timestamp: Date;
    deals?: Deal[];
    orders?: Order[];
    payments?: Payment[];
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [userName, setUserName] = useState("there");
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userData = getUserData();
        if (userData && userData.name) {
            setUserName(userData.name);
        }

        setMessages([
            {
                id: 1,
                text: `Hi ${userData?.name || "there"}! 👋 I'm Mobo — your smart shopping assistant!
What would you like to explore today?

• 🛍️ New Deals
• 📦 Orders
• 💳 Payment Status
• 🛠️ Support / Others

Just type what you need and I'll take care of it!`,
                sender: "bot",
                timestamp: new Date(),
            },
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const quickActions = [
        { icon: Flame, label: "New Deals", color: "text-orange-500" },
        { icon: Package, label: "Orders", color: "text-amber-700" },
        { icon: CreditCard, label: "Status", color: "text-blue-500" },
        { icon: MessageSquare, label: "Other", color: "text-purple-400" },
    ];

    const handleSendMessage = async () => {
        if (inputValue.trim() && !isLoading) {
            const userMessage = inputValue.trim();
            const newMessage: Message = {
                id: messages.length + 1,
                text: userMessage,
                sender: "user",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newMessage]);
            setInputValue("");
            setIsLoading(true);

            const loadingMessage: Message = {
                id: -1,
                text: "",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, loadingMessage]);

            try {
                const response = await sendChatMessage(userMessage, sessionId);

                if (response.success && response.data?.sessionId) {
                    setSessionId(response.data.sessionId);
                }

                setMessages((prev) => {
                    const withoutLoading = prev.filter((msg) => msg.id !== -1);
                    const botMessage: Message = {
                        id: withoutLoading.length + 1,
                        text: response.message || "I'm sorry, I couldn't process that.",
                        sender: "bot",
                        timestamp: new Date(),
                        deals: response.data?.deals,
                        orders: response.data?.orders,
                        payments: response.data?.payments,
                    };
                    return [...withoutLoading, botMessage];
                });
            } catch (error: any) {
                setMessages((prev) => {
                    const withoutLoading = prev.filter((msg) => msg.id !== -1);
                    const errorMessage: Message = {
                        id: withoutLoading.length + 1,
                        text: "Sorry, I encountered an error. Please try again.",
                        sender: "bot",
                        timestamp: new Date(),
                    };
                    return [...withoutLoading, errorMessage];
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleQuickAction = (label: string) => {
        const actionTexts: { [key: string]: string } = {
            "New Deals": "show me latest deals",
            "Orders": "show me my all orders",
            "Status": "show me the payment status of my orders",
            "Other": "i need support"
        };
        setInputValue(actionTexts[label] || label);
    };

    const handleShoppingBagClick = async () => {
        setShowOrders(true);
        setIsLoadingOrders(true);
        try {
            const response = await fetchOrders();
            if (response.success && response.data?.orders) {
                setOrders(response.data.orders);
                setFilteredOrders(response.data.orders);
            } else {
                setOrders([]);
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        if (status === "all") {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status.toLowerCase() === status.toLowerCase()));
        }
    };

    const statusOptions = [
        { value: "all", label: "All Orders" },
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <main className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-lime-50 via-white to-emerald-50" />

            <div className="absolute top-0 left-0 w-96 h-96 bg-lime-300/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

            <div className="relative w-full max-w-4xl h-[90vh] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 hover:scale-105 transition-all duration-300">
                <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10 shadow-sm">
                    {showOrders ? (
                        <button
                            onClick={() => setShowOrders(false)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                    ) : (
                        <Link
                            href="/"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    )}

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-lime-500" />
                            <h1 className="text-lg font-semibold text-gray-900">{showOrders ? "My Orders" : "Mobo Deal Bot"}</h1>
                        </div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">ONLINE</p>
                    </div>

                    {showOrders ? (
                        <button
                            onClick={() => setShowOrders(false)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    ) : (
                        <button
                            onClick={handleShoppingBagClick}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingBag className="h-6 w-6" />
                        </button>
                    )}
                </header>

                {showOrders ? (
                    <div className="flex-1 overflow-y-auto bg-gray-200/70">
                        <div className="p-4 max-w-3xl mx-auto">
                            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</h2>
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleStatusFilter(option.value)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                selectedStatus === option.value
                                                    ? "bg-neutral-950 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isLoadingOrders ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">No orders found</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {selectedStatus === "all" 
                                            ? "You don't have any orders yet." 
                                            : `You don't have any ${selectedStatus} orders.`}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredOrders.map((order) => (
                                        <OrderCard key={order.orderId} order={order} variant="grid" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-200/70">
                    <div className="flex items-center justify-center">
                        <div className="bg-gray-300 text-gray-600 text-xs font-medium px-4 py-1 rounded-full">
                            TODAY
                        </div>
                    </div>

                    {messages.map((message) => (
                        message.id === -1 ? (
                            <div key="loading" className="flex justify-start">
                                <div className="shrink-0 mr-3">
                                    <div className="h-10 w-10 rounded-full bg-lime-400 flex items-center justify-center">
                                        <BotMessageSquare className="h-5 w-5 text-gray-800" />
                                    </div>
                                </div>
                                <div className="bg-white text-gray-700 shadow-sm rounded-3xl px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {message.sender === "bot" && (
                                    <div className="shrink-0 mr-3">
                                        <div className="h-10 w-10 rounded-full bg-lime-400 flex items-center justify-center">
                                            <BotMessageSquare className="h-5 w-5 text-gray-800" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 max-w-[75%]">
                                    {message.text && (
                                        <div
                                            className={`rounded-3xl px-5 py-4 ${message.sender === "bot"
                                                ? "bg-white text-gray-700 shadow-sm"
                                                : "bg-neutral-950 text-white"
                                                }`}
                                        >
                                            <p className="text-[15px] leading-relaxed whitespace-pre-line">{message.text}</p>
                                        </div>
                                    )}

                                    {message.deals && message.deals.length > 0 && (
                                        <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                            <div className="flex gap-4 min-w-max">
                                                {message.deals.map((deal) => (
                                                    <DealCard key={deal.dealId} deal={deal} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {message.orders && message.orders.length > 0 && (
                                        <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                            <div className="flex gap-4 min-w-max">
                                                {message.orders.map((order) => (
                                                    <OrderCard key={order.orderId} order={order} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {message.payments && message.payments.length > 0 && (
                                        <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                            <div className="flex gap-4 min-w-max">
                                                {message.payments.map((payment) => (
                                                    <PaymentCard key={payment.paymentId} payment={payment} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="bg-gray-200/70 px-4 py-4 space-y-4">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => handleQuickAction(action.label)}
                                className="flex items-center gap-2 bg-white rounded-2xl p-3 hover:bg-gray-50 hover:scale-105 hover:cursor-pointer transition-all"
                            >
                                <action.icon className={`h-5 w-5 ${action.color}`} />
                                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative flex items-center gap-3 bg-white rounded-full px-5 py-3.5 shadow-sm w-full max-w-lg mx-auto">
                        <div className="bg-gray-200/80 p-3 rounded-full">
                            <Mic className="h-6 w-6 text-gray-400 shrink-0" />
                        </div>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && inputValue.trim() && handleSendMessage()}
                            placeholder="Ask for 'Review Deals'..."
                            className="flex-1 bg-transparent text-gray-700 placeholder:text-gray-400 outline-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className={`shrink-0 transition-all ${inputValue.trim() && !isLoading
                                ? 'text-neutral-800 bg-lime-500 p-3 rounded-full hover:scale-110'
                                : 'text-gray-400 bg-gray-200/80 p-3 rounded-full cursor-not-allowed'
                                }`}
                        >
                            <Send className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                    </>
                )}
            </div>
        </main>
    );
}
