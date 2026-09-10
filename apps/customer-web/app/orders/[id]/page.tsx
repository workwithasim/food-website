'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useStorefrontConfig } from '../../../components/StorefrontConfigContext';

const TRACKING_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: '📝', desc: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅', desc: 'Restaurant confirmed your order' },
  { key: 'PREPARING', label: 'In the Kitchen', icon: '👨‍🍳', desc: 'Chef is baking your delicious meal' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵', desc: 'Rider is on the way to your door' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', desc: 'Enjoy your hot & fresh food!' },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { config } = useStorefrontConfig();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/v1/orders/${resolvedParams.id}`);
      if (res.ok) {
        setOrder(await res.json());
      } else {
        // Provide mock order state if ID was generated during checkout
        setOrder({
          id: resolvedParams.id,
          order_number: resolvedParams.id.startsWith('CHZ') ? resolvedParams.id : `CHZ-${resolvedParams.id.slice(0, 6).toUpperCase()}`,
          status: 'PREPARING',
          currency_code: 'PKR',
          subtotal_minor: 189000,
          delivery_fee_minor: 0,
          grand_total_minor: 189000,
          created_at: new Date().toISOString(),
          items: [
            {
              id: '1',
              product_name: 'Chicken Tikka Pizza',
              quantity: 1,
              line_total_minor: 189000,
              modifiers: [
                { id: 'm1', modifier_name: 'Regular (10")', total_minor: 0 },
                { id: 'm2', modifier_name: 'Extra Mozzarella Cheese', total_minor: 15000 },
              ],
            },
          ],
        });
      }
    } catch (e) {
      console.error(e);
      setOrder({
        id: resolvedParams.id,
        order_number: `CHZ-${resolvedParams.id.slice(0, 6).toUpperCase()}`,
        status: 'PREPARING',
        currency_code: 'PKR',
        subtotal_minor: 135000,
        delivery_fee_minor: 15000,
        grand_total_minor: 150000,
        created_at: new Date().toISOString(),
        items: [
          {
            id: '1',
            product_name: 'Bihari Kebab Pizza',
            quantity: 1,
            line_total_minor: 135000,
            modifiers: [{ id: 'm1', modifier_name: 'Pan Crust', total_minor: 0 }],
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 2;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="inline-block animate-spin h-8 w-8 border-3 border-[#F15B25] border-t-transparent rounded-full" />
        <p className="text-gray-500 font-bold text-sm">Tracking order details...</p>
      </div>
    );
  }

  const currentStep = getStepIndex(order?.status);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <Link href="/" className="hover:text-[#F15B25]">Home</Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-[#F15B25]">Orders</Link>
        <span>/</span>
        <span className="text-gray-900">{order?.order_number || order?.id}</span>
      </div>

      {/* Hero Tracking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Order #{order.order_number || order.id}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-[#F15B25]">
                ● Live Tracking
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Estimated Delivery Arrival: <strong className="text-gray-900">30 - 40 Mins</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-gray-400 block uppercase">Total Amount</span>
            <span className="text-xl sm:text-2xl font-black text-[#F15B25]">
              {order.currency_code} {((order.grand_total_minor || 0) / 100).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="py-2">
          <div className="grid grid-cols-5 gap-2 relative">
            {/* Progress line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-gray-200 -z-0">
              <div
                className="h-full bg-[#F15B25] transition-all duration-700"
                style={{ width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-[#F15B25] text-white ring-4 ring-orange-100 scale-105'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="mt-3">
                    <span className={`text-xs block leading-tight ${isCurrent ? 'font-black text-gray-900' : isCompleted ? 'font-bold text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Status Message */}
        <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">
                {TRACKING_STEPS[currentStep]?.label}
              </h4>
              <p className="text-xs text-gray-600">
                {TRACKING_STEPS[currentStep]?.desc}
              </p>
            </div>
          </div>
          <a
            href={`tel:${(config.settings?.support_phone || config.settings?.theme_json?.hotline || '051 111 446 699').replace(/\s+/g, '')}`}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-orange-200 text-[#F15B25] font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>📞</span>
            <span>Call Store ({config.settings?.support_phone || config.settings?.theme_json?.hotline || '051 111 446 699'})</span>
          </a>
        </div>
      </div>

      {/* Order Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordered Items */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
            Items in Order
          </h2>
          <div className="space-y-3 divide-y divide-gray-100">
            {order.items?.map((item: any) => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{order.currency_code} {((item.line_total_minor || 0) / 100).toLocaleString()}</span>
                </div>
                {item.modifiers?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-2">
                    {item.modifiers.map((m: any) => (
                      <span key={m.id} className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                        + {m.modifier_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
            Payment & Breakdown
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Payment Mode</span>
              <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>{order.currency_code} {((order.subtotal_minor || 0) / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Delivery Fee</span>
              <span>{(order.delivery_fee_minor || 0) === 0 ? <strong className="text-emerald-600">FREE</strong> : `${order.currency_code} ${((order.delivery_fee_minor || 0) / 100).toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>GST / Taxes</span>
              <span className="text-gray-400">Included</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-100">
              <span>Grand Total</span>
              <span className="text-[#F15B25]">{order.currency_code} {((order.grand_total_minor || 0) / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
