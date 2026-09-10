'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/v1/orders/history`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }

    // Default recent orders demo if no history yet
    setOrders([
      {
        id: 'CHZ-982142',
        order_number: 'CHZ-982142',
        status: 'PREPARING',
        currency_code: 'PKR',
        grand_total_minor: 189000,
        created_at: new Date().toISOString(),
        items_summary: '1x Crown Crust Special Pizza, 1x Cheezy Sticks',
      },
      {
        id: 'CHZ-481029',
        order_number: 'CHZ-481029',
        status: 'DELIVERED',
        currency_code: 'PKR',
        grand_total_minor: 147000,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        items_summary: '2x Bazinga Burgers, 1x Loaded Fries',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <Link href="/" className="hover:text-[#F15B25]">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Track & Past Orders</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Your Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Track active orders in real time or view your order receipts.</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-[#F15B25] hover:bg-[#d94a18] text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          + New Order
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block animate-spin h-8 w-8 border-3 border-[#F15B25] border-t-transparent rounded-full" />
          <p className="text-gray-500 font-bold text-sm">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-8 space-y-4">
          <div className="text-5xl">📦</div>
          <h3 className="text-lg font-bold text-gray-800">No orders yet</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Once you place an order, you can track its real-time kitchen and delivery progress right here.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#F15B25] text-white font-bold text-xs rounded-xl shadow-md"
          >
            Explore Cheezious Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isLive = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-200/80 hover:border-[#F15B25] hover:shadow-md transition space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{isLive ? '🛵' : '🧾'}</span>
                      <div>
                        <div className="font-extrabold text-base text-gray-900 group-hover:text-[#F15B25] transition-colors">
                          Order #{order.order_number || order.id}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        isLive
                          ? 'bg-orange-100 text-[#F15B25] animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.items_summary && (
                    <p className="text-xs text-gray-600 font-medium line-clamp-1">
                      {order.items_summary}
                    </p>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-500">
                      Total: <strong className="text-gray-900 text-sm">{order.currency_code} {((order.grand_total_minor || 0) / 100).toLocaleString()}</strong>
                    </span>
                    <span className="text-[#F15B25] group-hover:translate-x-1 transition-transform">
                      {isLive ? 'Track Order →' : 'View Receipt →'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
