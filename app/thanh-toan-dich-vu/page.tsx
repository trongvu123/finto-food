"use client";

import BookingSuccess from "@/components/service-supplier/booking-success";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingSuccessPageContent />
        </Suspense>
    );
}

function BookingSuccessPageContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderId");
    const [serviceOrder, setServiceOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServiceOrder = async () => {
            if (!orderCode) {
                setError("Order code is missing.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/service-orders/${orderCode}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch service order: ${response.status}`);
                }
                const data = await response.json();
                setServiceOrder(data);
                setLoading(false);
            } catch (e: any) {
                setError(e.message);
                setLoading(false);
            }
        };

        fetchServiceOrder();
    }, [orderCode]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!serviceOrder) {
        return <div>Service order not found.</div>;
    }

    return <BookingSuccess serviceOrder={serviceOrder} />;
}
