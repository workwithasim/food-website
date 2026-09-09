export default function BranchDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Branch Dashboard</h1>
      
      {/* Branch KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Live Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending Acceptance</h3>
          <p className="mt-2 text-3xl font-semibold text-amber-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Riders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">4</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Sold Out Items</h3>
          <p className="mt-2 text-3xl font-semibold text-red-600">2</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 font-bold">!</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              There are 3 orders waiting to be accepted. Please review them immediately to avoid auto-cancellation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
