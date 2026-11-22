import { TrendingUp, TrendingDown } from 'lucide-react';
const colorMap = { blue: 'from-blue-500 to-blue-600', green: 'from-green-500 to-green-600', purple: 'from-purple-500 to-purple-600', amber: 'from-amber-500 to-amber-600', red: 'from-red-500 to-red-600', emerald: 'from-emerald-500 to-emerald-600', indigo: 'from-indigo-500 to-indigo-600', yellow: 'from-yellow-500 to-yellow-600' };
const StatsCard = ({ title, value, icon: Icon, trend, trendUp, color = 'blue' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {trend}%
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue}`}>
        {Icon && <Icon className="h-6 w-6 text-white" />}
      </div>
    </div>
  </div>
);
export default StatsCard;

