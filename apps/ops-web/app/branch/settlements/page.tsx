export default function CODPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">COD Settlements</h1>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Pending Cash Collection</h2>
            <p className="text-sm text-gray-500">Cash that riders need to submit to the branch.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">Rs 8,450</p>
            <p className="text-sm text-gray-500">Total Outstanding</p>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries Completed</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Held</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Settle</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { name: 'Kamran Ali', deliveries: 3, cash: 'Rs 4,200' },
              { name: 'Ahmed Raza', deliveries: 2, cash: 'Rs 3,100' },
              { name: 'Zain Abbas', deliveries: 1, cash: 'Rs 1,150' },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.deliveries} deliveries today</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{r.cash}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold hover:bg-blue-100">
                    Receive Cash
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
