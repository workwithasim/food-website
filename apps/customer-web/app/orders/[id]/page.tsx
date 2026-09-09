'use client';

import { useEffect, useState, use } from 'react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:3001/v1/orders/${resolvedParams.id}`);
      if (res.ok) {
        setOrder(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading order...</div>;
  if (!order) return <div className="p-10 text-center text-red-500">Order not found.</div>;

  return (
    <div className="container mx-auto p-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between font-medium">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{order.currency_code} {(item.line_total_minor / 100).toFixed(2)}</span>
                </div>
                {item.modifiers?.length > 0 && (
                  <ul className="text-sm text-gray-500 mt-1 pl-4 space-y-1">
                    {item.modifiers.map((mod: any) => (
                      <li key={mod.id}>+ {mod.modifier_name} ({(mod.total_minor / 100).toFixed(2)})</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <hr className="my-6 border-gray-200" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{order.currency_code} {(order.subtotal_minor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>{order.currency_code} {(order.tax_minor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{order.currency_code} {(order.delivery_fee_minor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <span>{order.currency_code} {(order.grand_total_minor / 100).toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 p-6 rounded-2xl border h-fit">
          <h2 className="text-xl font-semibold mb-4">Status History</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {order.history?.map((hist: any) => (
              <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="12" height="10">
                    <path fillRule="nonzero" d="M10.422 1.257 4.655 7.025 2.553 4.923A.916.916 0 0 0 1.257 6.22l2.75 2.75a.916.916 0 0 0 1.296 0l6.415-6.416a.916.916 0 0 0-1.296-1.296Z" />
                  </svg>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow">
                  <div className="font-bold text-slate-800">{hist.to_status}</div>
                  <div className="text-xs text-gray-500">{new Date(hist.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
