'use client';
import { useState, useEffect } from 'react';

// KDS specific components
function KdsOrderCard({ 
  orderId, 
  time, 
  items, 
  status, 
  onAction 
}: { 
  orderId: string, 
  time: string, 
  items: string[], 
  status: 'new' | 'preparing' | 'ready', 
  onAction: () => void 
}) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border-2 border-gray-700 flex flex-col h-full shrink-0 min-h-[300px]">
      <div className={`p-4 border-b-4 ${
        status === 'new' ? 'border-red-500 bg-red-950/30' : 
        status === 'preparing' ? 'border-yellow-500 bg-yellow-950/30' : 
        'border-green-500 bg-green-950/30'
      } flex justify-between items-center rounded-t-lg`}>
        <span className="text-4xl font-black text-white">#{orderId}</span>
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-gray-300">Elapsed</span>
          <span className="text-2xl font-bold text-red-400">{time}</span>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-4">
          {items.map((item, idx) => (
            <li key={idx} className="text-2xl font-bold text-gray-100 flex flex-col border-b border-gray-700 pb-3 last:border-0">
              <div className="flex items-start">
                <span className="bg-gray-700 text-white px-2 py-1 rounded mr-3 text-xl">1x</span>
                {item}
              </div>
              <ul className="mt-2 pl-12 text-lg text-gray-400 font-medium list-disc">
                <li>No onions</li>
                <li>Extra cheese</li>
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 mt-auto">
        {status !== 'ready' && (
          <button 
            onClick={onAction}
            className={`w-full py-4 rounded-lg text-2xl font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-transform ${
              status === 'new' ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {status === 'new' ? 'Start' : 'Mark Ready'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function KDSPage() {
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex space-x-6">
      
      {/* NEW Lane */}
      <div className="w-[450px] flex-none flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-red-900/50 p-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-white tracking-widest">NEW</h2>
            <span className="text-sm text-gray-400 font-medium">{currentTime}</span>
          </div>
          <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xl font-bold">2</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          <KdsOrderCard 
            orderId="1021" 
            time="5m 12s" 
            items={['Mighty Zinger', 'Fries']} 
            status="new" 
            onAction={() => {}} 
          />
          <KdsOrderCard 
            orderId="1022" 
            time="1m 05s" 
            items={['Pepperoni Pizza (L)']} 
            status="new" 
            onAction={() => {}} 
          />
        </div>
      </div>

      {/* PREPARING Lane */}
      <div className="w-[450px] flex-none flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-yellow-900/50 p-4 flex justify-between items-center">
          <h2 className="text-3xl font-black text-white tracking-widest">PREPARING</h2>
          <span className="bg-yellow-600 text-white px-4 py-1 rounded-full text-xl font-bold">1</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          <KdsOrderCard 
            orderId="1017" 
            time="14m 30s" 
            items={['Chicken Fajita (M)']} 
            status="preparing" 
            onAction={() => {}} 
          />
        </div>
      </div>

      {/* READY Lane */}
      <div className="w-[450px] flex-none flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-green-900/50 p-4 flex justify-between items-center">
          <h2 className="text-3xl font-black text-white tracking-widest">READY</h2>
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-xl font-bold">3</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {/* Mock ready items that just show what they are, no action buttons */}
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-500">
             <div className="flex justify-between items-center">
                <span className="text-4xl font-black text-gray-300">#1015</span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded font-bold">Awaiting Rider</span>
             </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-500">
             <div className="flex justify-between items-center">
                <span className="text-4xl font-black text-gray-300">#1012</span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded font-bold">Awaiting Rider</span>
             </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
