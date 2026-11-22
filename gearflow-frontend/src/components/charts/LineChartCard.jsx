import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const LineChartCard = ({ title, data = [], dataKey = 'value', xAxisKey = 'name', color = '#3b82f6' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} /></LineChart>
    </ResponsiveContainer>
  </div>
);
export default LineChartCard;

