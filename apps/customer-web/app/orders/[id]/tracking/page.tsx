'use client';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const eta = '25-35 min';

  // Dummy effect for realtime socket connection status
  const isConnected = true;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 relative">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/orders" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Track Order</h1>
        </div>
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs font-semibold text-gray-500 uppercase">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </header>

      {/* Map Placeholder */}
      <div className="h-64 bg-gray-200 relative w-full border-b border-gray-300 flex flex-col items-center justify-center">
        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <p className="text-gray-500 font-medium text-sm">Map Integration Placeholder</p>
        
        {/* Estimated Time overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Arrival Time</p>
          <p className="text-xl font-black text-gray-900">{eta}</p>
        </div>
      </div>

      <div className="p-4 space-y-6 relative -mt-4 bg-white rounded-t-2xl shadow-sm z-20 mx-2">
        {/* Rider Card */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg overflow-hidden relative">
              <span className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100"></span>
              <span className="relative z-10">AK</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Ahmed Khan</h3>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                4.9 (120+ trips)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Honda CD70 • LEE-4091</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center hover:bg-green-200 transition shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </button>
        </div>

        {/* Status Timeline */}
        <div className="pt-2">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Order Status</h2>
          
          <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-gray-200">
            
            {/* Step 1: Placed (Completed) */}
            <div className="relative flex items-start">
              <div className="absolute -left-6 bg-green-500 rounded-full p-0.5 border-4 border-white shadow-sm ring-1 ring-gray-100 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">Order Confirmed</h4>
                <p className="text-xs text-gray-500 font-medium">Your order has been received by Central Branch.</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">07:12 PM</p>
              </div>
            </div>

            {/* Step 2: Preparing (Completed) */}
            <div className="relative flex items-start">
              <div className="absolute -left-6 bg-green-500 rounded-full p-0.5 border-4 border-white shadow-sm ring-1 ring-gray-100 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">Preparing</h4>
                <p className="text-xs text-gray-500 font-medium">The kitchen is preparing your order.</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">07:15 PM</p>
              </div>
            </div>

            {/* Step 3: On The Way (Active) */}
            <div className="relative flex items-start">
              <div className="absolute -left-6 bg-blue-500 rounded-full w-4 h-4 border-4 border-white shadow-sm ring-1 ring-gray-100 mt-1 animate-pulse"></div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-600 text-sm">On The Way</h4>
                <p className="text-xs text-gray-600 font-medium">Your rider has picked up the order and is on the way.</p>
                <p className="text-[10px] text-blue-400 font-semibold mt-1">07:22 PM</p>
              </div>
            </div>

            {/* Step 4: Delivered (Pending) */}
            <div className="relative flex items-start opacity-40">
              <div className="absolute -left-6 bg-gray-300 rounded-full w-4 h-4 border-4 border-white shadow-sm ring-1 ring-gray-100 mt-1"></div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-700 text-sm">Delivered</h4>
                <p className="text-xs text-gray-500 font-medium">Enjoy your meal!</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Delivery OTP Notice (Optional) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Delivery Code</p>
            <p className="text-lg font-black tracking-widest text-gray-900">1492</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-gray-500 font-medium max-w-[120px]">Show this code to the rider when they arrive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
