export const StatsCards = ({ total, active, verified }) => (
  <div className="flex gap-4 mt-4 mb-6">
    <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
      <p className="text-sm text-gray-600">Total Owners</p>
      <p className="text-2xl font-bold text-gray-900">{total}</p>
    </div>
    <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
      <p className="text-sm text-gray-600">Active</p>
      <p className="text-2xl font-bold text-green-600">{active}</p>
    </div>
    <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
      <p className="text-sm text-gray-600">Verified</p>
      <p className="text-2xl font-bold text-blue-600">{verified}</p>
    </div>
  </div>
);