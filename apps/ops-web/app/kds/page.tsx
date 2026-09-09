'use client';

import React, { useState, useEffect } from 'react';

interface KdsOrder {
  id: string;
  orderNumber: string;
  minutesAgo: number;
  items: string[];
  notes: string[];
  status: 'new' | 'preparing' | 'ready';
}

function KdsOrderCard({ 
  order, 
  onAdvance 
}: { 
  order: KdsOrder;
  onAdvance: () => void;
}) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-xl border-2 border-gray-700 flex flex-col h-full shrink-0 min-h-[320px] transition-all">
      <div className={`p-4 border-b-4 ${
        order.status === 'new' ? 'border-red-500 bg-red-950/40' : 
        order.status === 'preparing' ? 'border-amber-500 bg-amber-950/40' : 
        'border-emerald-500 bg-emerald-950/40'
      } flex justify-between items-center rounded-t-xl`}>
        <span className="text-3xl font-black text-white">#{order.orderNumber}</span>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Elapsed</span>
          <span className="text-xl font-extrabold text-red-400">{order.minutesAgo}m</span>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="border-b border-gray-700/60 pb-3 last:border-0">
              <div className="flex items-start text-lg font-bold text-gray-100">
                <span className="bg-gray-700 text-white px-2 py-0.5 rounded mr-2.5 text-sm font-black">1x</span>
                <span>{item}</span>
              </div>
              {order.notes.length > 0 && (
                <ul className="mt-1.5 pl-10 text-xs text-amber-300/90 font-semibold list-disc space-y-0.5">
                  {order.notes.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 mt-auto border-t border-gray-750">
        <button 
          onClick={onAdvance}
          className={`w-full py-3.5 rounded-lg text-lg font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer ${
            order.status === 'new' 
              ? 'bg-amber-600 hover:bg-amber-500' 
              : order.status === 'preparing'
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {order.status === 'new' ? '▶ Start Cooking' : order.status === 'preparing' ? '✓ Mark Ready' : 'Hand Over to Rider 🛵'}
        </button>
      </div>
    </div>
  );
}

export default function KDSPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [orders, setOrders] = useState<KdsOrder[]>([
    { id: '1', orderNumber: '1021', minutesAgo: 3, items: ['Mighty Zinger', 'Loaded Fries'], notes: ['No onions', 'Extra mayo'], status: 'new' },
    { id: '2', orderNumber: '1022', minutesAgo: 1, items: ['Pepperoni Pizza (L)'], notes: ['Extra crispy crust'], status: 'new' },
    { id: '3', orderNumber: '1018', minutesAgo: 8, items: ['Chicken Fajita (M)', 'Garlic Bread'], notes: ['Spicy sauce'], status: 'preparing' },
    { id: '4', orderNumber: '1015', minutesAgo: 15, items: ['2x Classic Burger'], notes: [], status: 'ready' },
  ]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdvance = (id: string) => {
    setOrders(prev => {
      const target = prev.find(o => o.id === id);
      if (!target) return prev;

      if (target.status === 'new') {
        setNotification(`Order #${target.orderNumber} moved to PREPARING lane.`);
        return prev.map(o => o.id === id ? { ...o, status: 'preparing' } : o);
      } else if (target.status === 'preparing') {
        setNotification(`Order #${target.orderNumber} is READY! Bell alerted.`);
        return prev.map(o => o.id === id ? { ...o, status: 'ready' } : o);
      } else {
        setNotification(`Order #${target.orderNumber} completed and dispatched!`);
        return prev.filter(o => o.id !== id);
      }
    });

    setTimeout(() => setNotification(null), 3000);
  };

  const newOrders = orders.filter(o => o.status === 'new');
  const prepOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="h-full flex flex-col space-y-4">
      {notification && (
        <div className="fixed top-16 right-8 z-50 bg-emerald-900 border border-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center space-x-2 animate-bounce">
          <span>🔔</span>
          <span>{notification}</span>
        </div>
      )}

      <div className="flex-1 flex space-x-6 overflow-x-auto pb-2">
        {/* NEW Lane */}
        <div className="w-[420px] flex-none flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-red-950/70 p-4 border-b border-red-900/60 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">NEW ORDERS</h2>
              <span className="text-xs text-red-300 font-medium">Clock: {currentTime}</span>
            </div>
            <span className="bg-red-600 text-white px-3.5 py-1 rounded-full text-lg font-black">{newOrders.length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {newOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-16 text-sm">No new orders in queue.</p>
            ) : (
              newOrders.map(order => (
                <KdsOrderCard key={order.id} order={order} onAdvance={() => handleAdvance(order.id)} />
              ))
            )}
          </div>
        </div>

        {/* PREPARING Lane */}
        <div className="w-[420px] flex-none flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-amber-950/70 p-4 border-b border-amber-900/60 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">PREPARING</h2>
              <span className="text-xs text-amber-300 font-medium">Cooking in progress</span>
            </div>
            <span className="bg-amber-600 text-white px-3.5 py-1 rounded-full text-lg font-black">{prepOrders.length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {prepOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-16 text-sm">Kitchen is clear.</p>
            ) : (
              prepOrders.map(order => (
                <KdsOrderCard key={order.id} order={order} onAdvance={() => handleAdvance(order.id)} />
              ))
            )}
          </div>
        </div>

        {/* READY Lane */}
        <div className="w-[420px] flex-none flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-emerald-950/70 p-4 border-b border-emerald-900/60 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">READY FOR PICKUP</h2>
              <span className="text-xs text-emerald-300 font-medium">Awaiting delivery dispatch</span>
            </div>
            <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-full text-lg font-black">{readyOrders.length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {readyOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-16 text-sm">No ready orders.</p>
            ) : (
              readyOrders.map(order => (
                <KdsOrderCard key={order.id} order={order} onAdvance={() => handleAdvance(order.id)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
