export default function BranchRidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Riders & Assignments</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Active Deliveries</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {[
              { id: 'ORD-1015', rider: 'Kamran Ali', status: 'On the way', eta: '10 min' },
              { id: 'ORD-1012', rider: 'Usman Tariq', status: 'At location', eta: 'Arrived' },
            ].map((delivery, i) => (
              <li key={i} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">{delivery.id}</p>
                  <p className="text-sm text-gray-500">Assigned to: <span className="font-medium text-gray-700">{delivery.rider}</span></p>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 mb-1">
                    {delivery.status}
                  </span>
                  <p className="text-xs text-gray-500">ETA: {delivery.eta}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Available Riders (2)</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {[
              { name: 'Ahmed Raza', status: 'Waiting at branch' },
              { name: 'Zain Abbas', status: 'Returning (2 min away)' },
            ].map((rider, i) => (
              <li key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{rider.name}</p>
                  <p className="text-xs text-gray-500">{rider.status}</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
