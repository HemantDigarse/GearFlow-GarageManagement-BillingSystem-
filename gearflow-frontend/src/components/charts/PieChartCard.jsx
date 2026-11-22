import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
const PieChartCard = ({ title, data = [], dataKey = 'value', nameKey = 'name' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={280}>
      <PieChart><Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} label>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie><Tooltip /><Legend /></PieChart>
    </ResponsiveContainer>
  </div>
);
export default PieChartCard;

