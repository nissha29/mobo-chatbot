import { ExternalLink } from "lucide-react";
import { Deal } from "@/src/lib/api";

interface DealCardProps {
    deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
    return (
        <div className="shrink-0 w-72 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                    src={deal.imageURL}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                />
            </div>

            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {deal.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                    {deal.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-gray-900">
                        ₹{deal.price}
                    </span>
                    <button className="flex items-center gap-1 bg-neutral-950 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors">
                        <ExternalLink className="h-3 w-3" />
                        GET LINK / DM
                    </button>
                </div>
            </div>
        </div>
    );
}
