export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Tenant Settings</h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900">General Information</h2>
          <p className="text-sm text-gray-500 mb-4">Update your restaurant's basic information.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
              <input type="text" defaultValue="Antigravity Burger" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Email</label>
              <input type="email" defaultValue="support@example.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Branding</h2>
          <p className="text-sm text-gray-500 mb-4">Configure the look and feel of your customer app.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="mt-1 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 border border-gray-300"></div>
                <input type="text" defaultValue="#2563EB" className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center border border-gray-300">
                  <span className="text-gray-500 text-xs">Logo</span>
                </div>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex justify-end">
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
