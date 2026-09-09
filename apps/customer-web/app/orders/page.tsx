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
    try {
      // Assuming a real auth system would pass cookies. For this phase demo:
      const res = await fetch('http://localhost:3001/v1/orders/history');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="container mx-auto p-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="block bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{order.order_number}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  <span>{order.currency_code} {(order.grand_total_minor / 100).toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
