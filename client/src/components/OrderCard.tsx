import { Order } from "@/src/lib/api";

interface OrderCardProps {
    order: Order;
    variant?: "scroll" | "grid";
}

export default function OrderCard({ order, variant = "scroll" }: OrderCardProps) {
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
        if (statusLower === 'confirmed') return 'bg-blue-100 text-blue-800';
        if (statusLower === 'shipped') return 'bg-purple-100 text-purple-800';
        if (statusLower === 'delivered') return 'bg-lime-100 text-lime-800';
        if (statusLower === 'cancelled') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const cardClasses = variant === "scroll" 
        ? "shrink-0 w-72 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        : "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow";

    return (
        <div className={cardClasses}>
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                    src={order.imageURL}
                    alt={order.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                />
            </div>

            <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {order.productName}
                </h3>

                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                    </span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="text-xs font-mono text-gray-700">{order.orderId}</p>
                </div>
            </div>
        </div>
    );
}
