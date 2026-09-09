export default function BranchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Central Branch', status: 'Open', orders: 12, staff: 4 },
          { name: 'DHA Phase 5', status: 'Closed', orders: 0, staff: 0 },
        ].map((branch, i) => (
          <div key={i} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{branch.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${branch.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {branch.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{branch.orders}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Staff Online</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{branch.staff}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button className="text-amber-600 hover:text-amber-900 text-sm font-medium">Emergency Pause</button>
              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Settings</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
