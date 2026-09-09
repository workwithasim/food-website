export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Add Category
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {['Burgers', 'Pizza', 'Sides', 'Drinks', 'Desserts'].map((category, index) => (
            <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <span className="text-gray-400 mr-4 cursor-move">☰</span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500">{(5 - index) * 3} products</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
