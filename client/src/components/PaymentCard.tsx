import { Package } from "lucide-react";
import { Payment } from "@/src/lib/api";

interface PaymentCardProps {
    payment: Payment;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
    const orderStatus = payment.orderDetails?.status || 'Unknown';
    const productName = payment.orderDetails?.productName || 'N/A';
    const productImage = payment.orderDetails?.imageURL || '';
    const totalAmount = payment.amountPaid + payment.pendingAmount;
    const paymentStatus = payment.status === 'completed' ? 'Paid' : 'Pending';

    const formatOrderStatus = (status: string) => {
        return status.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    return (
        <div className="shrink-0 w-72 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg border-2 border-green-500 flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                        {formatOrderStatus(orderStatus)}
                    </span>
                </div>
            </div>

            <div className="px-4 py-3 flex items-center gap-3">
                {productImage && (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=No+Image";
                            }}
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {productName}
                    </h3>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                        Total: ₹{totalAmount.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="px-4 pb-4 pt-3 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Status:</span>
                    <span className={`text-xs font-medium ${
                        paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                        {paymentStatus}
                    </span>
                </div>
                <button className="bg-neutral-950 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors">
                    View
                </button>
            </div>
        </div>
    );
}
