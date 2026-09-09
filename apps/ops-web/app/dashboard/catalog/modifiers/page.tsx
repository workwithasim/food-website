export default function ModifiersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Modifier Groups</h1>
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Choose your drink', req: true, options: 3 },
          { name: 'Add-ons', req: false, options: 5 },
          { name: 'Crust Type', req: true, options: 2 },
        ].map((group, i) => (
          <div key={i} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${group.req ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                {group.req ? 'Required' : 'Optional'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{group.options} options configured</p>
            <div className="flex justify-end space-x-3">
              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
