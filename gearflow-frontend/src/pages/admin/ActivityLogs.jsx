import { useState, useEffect } from 'react';
import { getActivityLogs } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScrollText } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const res = await getActivityLogs(); setLogs(res.data.data || []); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <LoadingSpinner />;
  if (logs.length === 0) return <EmptyState icon={ScrollText} title="No activity logs" message="Activity logs will appear here" />;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Timestamp</th></tr></thead>
        <tbody>{logs.map((l,i) => (
          <tr key={i} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium">{l.action}</td><td className="px-4 py-3">{l.entityType}</td><td className="px-4 py-3">{l.details}</td><td className="px-4 py-3 text-gray-500">{l.createdAt}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
};
export default ActivityLogs;

