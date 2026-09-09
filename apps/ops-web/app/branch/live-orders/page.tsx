export default function LiveOrdersPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
        <div className="flex items-center text-sm text-green-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Realtime Connected
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {/* Column 1: New Orders */}
        <div className="flex-none w-80 bg-gray-100 rounded-lg flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700 flex justify-between">
              New Orders <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">2</span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="bg-white rounded shadow-sm border-l-4 border-red-500 p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">#ORD-1021</span>
                <span className="text-xs font-medium text-gray-500">2 min ago</span>
              </div>
              <ul className="text-sm text-gray-700 mb-4 list-disc list-inside">
                <li>1x Mighty Zinger</li>
                <li>2x Loaded Fries</li>
              </ul>
              <div className="flex space-x-2">
                <button className="flex-1 bg-green-600 text-white rounded py-1.5 text-sm font-medium hover:bg-green-700">Accept</button>
                <button className="flex-1 bg-gray-100 text-red-600 rounded py-1.5 text-sm font-medium hover:bg-gray-200">Reject</button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="flex-none w-80 bg-gray-100 rounded-lg flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700 flex justify-between">
              Preparing <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">1</span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="bg-white rounded shadow-sm border-l-4 border-blue-500 p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">#ORD-1018</span>
                <span className="text-xs font-medium text-gray-500">10 min ago</span>
              </div>
              <ul className="text-sm text-gray-700 mb-4 list-disc list-inside">
                <li>1x Chicken Fajita (L)</li>
              </ul>
              <button className="w-full bg-blue-600 text-white rounded py-1.5 text-sm font-medium hover:bg-blue-700">Mark Ready</button>
            </div>
          </div>
        </div>

        {/* Column 3: Ready / Delivery */}
        <div className="flex-none w-80 bg-gray-100 rounded-lg flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700 flex justify-between">
              Ready for Pickup <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">0</span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center">
            <p className="text-gray-400 text-sm">No orders ready.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
