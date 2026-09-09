export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">Rs 45,200</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">32</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">Rs 1,412</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-amber-600">5</p>
        </div>
      </div>

      {/* Operational Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="flex items-center justify-center h-48 bg-gray-50 text-gray-400 rounded border border-dashed border-gray-300">
            [Chart Placeholder]
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Needs Attention</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500 mr-3"></span>
              <p className="text-sm text-gray-600">3 orders delayed beyond ETA</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-amber-500 mr-3"></span>
              <p className="text-sm text-gray-600">1 payment requires manual review</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
