import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobCards, updateJobCardStatus } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ClipboardList, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
const JobCardList = () => {
  const [cards, setCards] = useState([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState('ALL'); const navigate = useNavigate();
  const fetch = async () => { try { setLoading(true); const res = await getJobCards({ status: filter !== 'ALL' ? filter : undefined }); setCards(res.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, [filter]);
  const tabs = ['ALL','CREATED','PENDING','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED'];
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4"><div className="flex gap-2 flex-wrap">{tabs.map(t=><button key={t} onClick={()=>setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.replace(/_/g,' ')}</button>)}</div>
      <button onClick={() => navigate('/garage/job-cards/new')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> New Job Card</button></div>
      {cards.length===0 ? <EmptyState icon={ClipboardList} title="No job cards" actionLabel="Create Job Card" onAction={() => navigate('/garage/job-cards/new')} /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Job #</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Problem</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Actions</th></tr></thead>
      <tbody>{cards.map(c=><tr key={c.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium text-blue-600">{c.jobCardNumber}</td><td className="px-4 py-3">{c.customerName}</td><td className="px-4 py-3">{c.vehicleRegNumber}</td><td className="px-4 py-3 max-w-[200px] truncate">{c.problemDescription}</td><td className="px-4 py-3">{c.assignedEmployeeName||'-'}</td><td className="px-4 py-3"><StatusBadge status={c.priority}/></td><td className="px-4 py-3"><StatusBadge status={c.status}/></td><td className="px-4 py-3">₹{c.totalAmount||0}</td>
      <td className="px-4 py-3"><button onClick={() => navigate(`/garage/job-cards/${c.id}`)} className="text-blue-600"><Eye className="h-4 w-4"/></button></td></tr>)}</tbody></table></div>}
    </div>);
};
export default JobCardList;

