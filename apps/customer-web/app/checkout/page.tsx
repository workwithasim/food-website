'use client';

import { useEffect, useState, useRef } from 'react';
import { useCart } from '../../components/CartProvider';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, isLoading } = useCart();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [branchId, setBranchId] = useState(''); // Allow user to type a branch ID for demo
  const [placingOrder, setPlacingOrder] = useState(false);
  const idempotencyKeyRef = useRef(typeof window !== 'undefined' ? crypto.randomUUID() : '');

  useEffect(() => {
    if (!isLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/');
    }
  }, [cart, isLoading, router]);

  const fetchQuote = async () => {
    if (!cart?.id || !branchId) return;
    setLoadingQuote(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/v1/checkout/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cart.id, branch_id: branchId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to fetch quote');
      }
      setQuote(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingQuote(false);
    }
  };

  const placeOrder = async () => {
    if (!cart?.id || !branchId || !quote) return;
    setPlacingOrder(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_id: cart.id,
          branch_id: branchId,
          idempotency_key: idempotencyKeyRef.current,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to place order');
      }
      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message);
      setPlacingOrder(false);
    }
  };

  if (isLoading || !cart?.items?.length) {
    return <div className="p-10 text-center">Loading checkout...</div>;
  }

  return (
    <div className="container mx-auto p-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Branch ID</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter a valid branch ID"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                />
              </div>
              <button 
                onClick={fetchQuote} 
                disabled={loadingQuote || !branchId}
                className="w-full bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50"
              >
                {loadingQuote ? 'Calculating...' : 'Calculate Quote'}
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </section>
        </div>

        <div>
          <section className="bg-gray-50 p-6 rounded-2xl border">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                </div>
              ))}
            </div>
            
            <hr className="my-4 border-gray-200" />
            
            {quote ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{quote.currency_code} {(quote.subtotal_minor / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>{quote.currency_code} {(quote.tax_minor / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{quote.currency_code} {(quote.delivery_fee_minor / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span>{quote.currency_code} {(quote.service_fee_minor / 100).toFixed(2)}</span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{quote.currency_code} {(quote.grand_total_minor / 100).toFixed(2)}</span>
                </div>
                <button 
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="w-full bg-green-600 text-white p-4 rounded-xl mt-6 hover:bg-green-700 font-semibold text-lg disabled:opacity-50"
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Enter delivery details to see your total.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
