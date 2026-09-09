'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/orders" className="text-gray-500 hover:text-gray-900">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order {orderId}</h1>
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Print Receipt
          </button>
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Mark Preparing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Customer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">1x Mighty Zinger Burger</h3>
                  <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                    <li>Extra Cheese</li>
                    <li>No Onions</li>
                  </ul>
                </div>
                <p className="font-medium text-gray-900">Rs 850</p>
              </div>
              <div className="flex justify-between items-start py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">2x Loaded Fries</h3>
                </div>
                <p className="font-medium text-gray-900">Rs 900</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <div className="w-1/2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">Rs 1,750</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">Rs 280</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="text-gray-900">Rs 150</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>Rs 2,180</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 text-sm text-gray-900">Ali Khan</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">+92 300 1234567</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                <p className="mt-1 text-sm text-gray-900">123 Street 4, Phase 5, DHA, Lahore</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status, Payment, Actions */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">Cash on Delivery</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Unpaid
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs">✓</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Order placed by <span className="font-medium text-gray-900">Customer</span></p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime="2020-09-20">12:41 PM</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ring-8 ring-white">
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Order accepted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-700 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">Cancel this order if it cannot be fulfilled. This action cannot be undone.</p>
            <button className="w-full px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
