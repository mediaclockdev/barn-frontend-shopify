"use client";

import useAuthStore from "@/src/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiBox,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiShoppingBag,
  FiArrowLeft,
  FiTruck,
  FiMapPin,
  FiExternalLink,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import Pagination from "@/src/components/misc/Pagination";

interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  total: string;
}

interface Order {
  id: string;
  number: number;
  status: string;
  currency: string;
  total: string;
  date: string;
  items: OrderItem[];
  tracking_number?: string | null;
  tracking_url?: string | null;
  tracking_company?: string | null;
  order_source?: string;
  shipping_method?: string;
}

export default function OrdersClient() {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/login?redirect=/orders");
    }
  }, [hasHydrated, user, router]);

  useEffect(() => {
    if (!hasHydrated) return;

    const controller = new AbortController();

    const fetchOrders = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const token = useAuthStore.getState().token;
        const res = await fetch(
          `/api/orders/user?page=${currentPage}&per_page=5`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await res.json();

        if (res.ok) {
          setOrders(data.orders || []);
          setTotalPages(data.totalPages || 1);
        } else {
          toast.error(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching orders:", error);
        toast.error("An error occurred while fetching orders.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      void fetchOrders();
    } else {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [hasHydrated, user, currentPage]);

  if (!hasHydrated || (!user && isLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "picked-up":
        return "bg-green-100 text-green-700 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
      case "on-hold":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "ready-pickup":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "picked-up":
        return <FiCheckCircle className="text-green-600" />;
      case "processing":
        return <FiPackage className="text-blue-600" />;
      case "pending":
      case "on-hold":
        return <FiClock className="text-yellow-600" />;
      case "cancelled":
      case "failed":
        return <FiXCircle className="text-red-600" />;
      case "ready-pickup":
        return <FiMapPin className="text-purple-600" />;
      case "shipped":
        return <FiTruck className="text-indigo-600" />;
      default:
        return <FiBox className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready-pickup":
        return "Ready for Pickup";
      case "picked-up":
        return "Picked Up";
      case "shipped":
        return "Shipped";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getDeliveryMethod = (order: Order) => {
    const method = order.shipping_method?.toLowerCase() || "";
    if (method.includes("australia post") || method.includes("auspost")) {
      return {
        label: "Australia Post",
        icon: <FiTruck className="" />,
      };
    }
    return { label: order.shipping_method || "Standard Delivery", icon: <FiPackage className="" /> };
  };

  // Determine order source
  const getOrderSource = (order: Order) => {
    const source = (order.order_source || "").toLowerCase();
    if (source === "ebay") {
      return { label: "eBay", emoji: "🛒", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    }
    return { label: "Website", emoji: "🌐", color: "bg-sky-100 text-sky-800 border-sky-200" };
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-4">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 sm:mb-6 font-medium text-sm sm:text-md"
        >
          <FiArrowLeft /> Back to Profile
        </Link>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5 sm:gap-3">
            <FiShoppingBag className="text-primary text-xl sm:text-2xl" />
            My Orders
          </h1>
          <p className="text-gray-500 mt-1.5 sm:mt-2 text-sm sm:text-lg font-medium">
            View and track your previous purchases.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Loading your orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiBox className="text-3xl sm:text-4xl text-gray-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-md max-w-md mx-auto">
              Looks like you haven&apos;t made any purchases yet. Explore our
              shop and find something you love!
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 sm:px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all text-sm sm:text-base"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 sm:space-y-6">
              {orders.map((order) => {
                const delivery = getDeliveryMethod(order);
                const source = getOrderSource(order);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-8">
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5 sm:mb-1">
                            Order Number
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                              #{order.number}
                            </p>
                            {/* Task 9: Order source badge */}
                            <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full border ${source.color}`}>
                              {source.emoji} {source.label}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5 sm:mb-1">
                            Date
                          </p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5 sm:mb-1">
                            Total
                          </p>
                          <p className="font-bold text-primary text-sm sm:text-base">
                            ${parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5 sm:mb-1">
                            Delivery Method
                          </p>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm sm:text-base">
                            {delivery.icon}
                            <span>{delivery.label}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 self-start md:self-auto w-fit ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{getStatusLabel(order.status)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 sm:p-6">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wider">
                        Items in Order
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {order.items?.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3 border-b border-gray-50 last:border-0 last:pb-0"
                          >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 relative">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 640px) 48px, 64px"
                                  className="object-cover"
                                />
                              ) : (
                                <FiBox className="text-xl sm:text-2xl text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 line-clamp-1 text-sm sm:text-base">
                                {item.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="font-bold text-gray-900 text-sm sm:text-base shrink-0">
                              ${parseFloat(item.total).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Task 8: Tracking number display */}
                      {order.tracking_number && (order.status === "shipped" || order.status === "completed") && (
                        <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <FiTruck className="text-indigo-600 text-lg shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Tracking Number</p>
                              <p className="text-sm sm:text-base font-bold text-indigo-900">{order.tracking_number}</p>
                            </div>
                          </div>
                          <a
                            href={order.tracking_url || `https://auspost.com.au/mypost/track/#/details/${order.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Track Package <FiExternalLink />
                          </a>
                        </div>
                      )}

                      {/* Task 10: Pickup instructions */}
                      {order.status === "ready-pickup" && (
                        <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 bg-purple-50 border border-purple-100 rounded-xl">
                          <div className="flex items-start gap-2">
                            <FiMapPin className="text-purple-600 text-lg shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-purple-800">Your order is ready for pickup!</p>
                              <p className="text-xs sm:text-sm text-purple-700 mt-1 font-medium">
                                📍 62-76 Kilmore Rd, Heathcote VIC 3523
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                Please bring your order confirmation or ID when picking up.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex justify-center sm:justify-end">
                        <Link
                          href={`/contact-us?order=${order.id}`}
                          className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
                        >
                          Need help with this order?
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination — same component as Shop */}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
