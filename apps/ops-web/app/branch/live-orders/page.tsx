'use client';

import React, { useState } from 'react';

interface OrderItem {
  id: string;
  orderNumber: string;
  timeAgo: string;
  items: string[];
  status: 'new' | 'preparing' | 'ready';
  total: string;
}

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: '1', orderNumber: '#ORD-1021', timeAgo: '2 min ago', items: ['1x Mighty Zinger', '2x Loaded Fries'], status: 'new', total: 'Rs 1,750' },
    { id: '2', orderNumber: '#ORD-1022', timeAgo: '4 min ago', items: ['1x Pepperoni Pizza (L)', '1x Garlic Bread'], status: 'new', total: 'Rs 2,100' },
    { id: '3', orderNumber: '#ORD-1018', timeAgo: '10 min ago', items: ['1x Chicken Fajita (L)', '1x 1.5L Coke'], status: 'preparing', total: 'Rs 1,890' },
    { id: '4', orderNumber: '#ORD-1015', timeAgo: '18 min ago', items: ['2x Classic Beef Burger'], status: 'ready', total: 'Rs 1,400' },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAccept = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'preparing', timeAgo: 'Just started' } : o));
    showToast(`Order accepted! Sent to Kitchen Display (KDS).`);
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this order? Customer will be refunded.')) {
      setOrders(prev => prev.filter(o => o.id !== id));
      showToast(`Order rejected and removed.`);
    }
  };

  const handleMarkReady = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ready', timeAgo: 'Ready now' } : o));
    showToast(`Order marked READY! Notifying rider for pickup.`);
  };

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="h-full flex flex-col space-y-5">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold border border-blue-500">
          ✓ {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Orders Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drag, accept, and advance orders through branch fulfillment.</p>
        </div>
        <div className="flex items-center text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Realtime WebSocket Connected
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {/* Column 1: New Orders */}
        <div className="flex-none w-88 bg-gray-100/80 border border-gray-200 rounded-xl flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
            <h2 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>New Orders</span>
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">{newOrders.length}</span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {newOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No pending orders.</p>
            ) : (
              newOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-gray-900">{order.orderNumber}</span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{order.timeAgo}</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center pt-2 border-t text-sm font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                  <div className="flex space-x-2 pt-1">
                    <button 
                      onClick={() => handleAccept(order.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-xs font-bold shadow-sm transition"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(order.id)}
                      className="flex-1 bg-gray-100 hover:bg-red-50 text-red-600 rounded-lg py-2 text-xs font-bold border border-gray-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="flex-none w-88 bg-gray-100/80 border border-gray-200 rounded-xl flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
            <h2 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>In Kitchen</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">{preparingOrders.length}</span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {preparingOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders currently preparing.</p>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border-l-4 border-amber-500 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-gray-900">{order.orderNumber}</span>
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{order.timeAgo}</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleMarkReady(order.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-bold shadow-sm transition"
                  >
                    Mark Ready for Pickup ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready / Delivery */}
        <div className="flex-none w-88 bg-gray-100/80 border border-gray-200 rounded-xl flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
            <h2 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>Ready for Delivery</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">{readyOrders.length}</span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {readyOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders waiting for rider.</p>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border-l-4 border-emerald-500 p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-gray-900">{order.orderNumber}</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Awaiting Rider</span>
                  </div>
                  <ul className="text-xs text-gray-600 list-disc pl-4">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Dispatching nearest available rider...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
