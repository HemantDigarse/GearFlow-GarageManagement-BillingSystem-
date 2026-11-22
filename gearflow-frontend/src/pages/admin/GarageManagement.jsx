import { useState, useEffect } from 'react';
import { getGarages, updateGarageStatus } from '../../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Building2, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GarageManagement = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStatus = searchParams.get('status')?.toUpperCase();
  const [filter, setFilter] = useState(['ACTIVE', 'INACTIVE', 'PENDING'].includes(requestedStatus) ? requestedStatus : 'ALL');
  const [confirm, setConfirm] = useState({ open: false, id: null, status: '' });
  const navigate = useNavigate();

  const fetchGarages = async () => {
    try { setLoading(true); const params = {}; if (search) params.search = search; if (filter !== 'ALL') params.status = filter;
      const res = await getGarages(params); setGarages(res.data.data || []); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchGarages(); }, [filter]);

  const handleSearch = () => fetchGarages();
  const handleFilterChange = (status) => {
    setFilter(status);
    const nextParams = new URLSearchParams(searchParams);
    if (status === 'ALL') nextParams.delete('status');
    else nextParams.set('status', status);
    setSearchParams(nextParams);
  };
  const handleStatusChange = async () => {
    try { await updateGarageStatus(confirm.id, confirm.status); toast.success('Status updated'); fetchGarages(); }
    catch (err) { toast.error('Failed to update status'); } finally { setConfirm({ open:false, id:null, status:'' }); }
  };

  const tabs = ['ALL','ACTIVE','INACTIVE','PENDING'];
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-80"><SearchBar value={search} onChange={setSearch} placeholder="Search garages..." /></div>
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium">Search</button>
      </div>
      <div className="flex gap-2">
        {tabs.map(t => <button key={t} onClick={() => handleFilterChange(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}</button>)}
      </div>
      {garages.length === 0 ? <EmptyState icon={Building2} title="No garages found" message="No garages match your criteria" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Garage</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>{garages.map(g => (
                <tr key={g.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{g.name}</td>
                  <td className="px-4 py-3">{g.ownerName}</td><td className="px-4 py-3">{g.email}</td><td className="px-4 py-3">{g.phone}</td><td className="px-4 py-3">{g.city}</td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{g.registrationDate}</td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => navigate(`/admin/garages/${g.id}`)} className="text-blue-600 hover:text-blue-800"><Eye className="h-4 w-4" /></button>
                    {g.status==='PENDING' && <><button onClick={() => setConfirm({open:true,id:g.id,status:'ACTIVE'})} className="text-green-600 hover:text-green-800" title="Approve"><CheckCircle className="h-4 w-4" /></button><button onClick={() => setConfirm({open:true,id:g.id,status:'INACTIVE'})} className="text-red-600 hover:text-red-800" title="Reject"><XCircle className="h-4 w-4" /></button></>}
                    {g.status==='ACTIVE' && <button onClick={() => setConfirm({open:true,id:g.id,status:'INACTIVE'})} className="text-red-600 hover:text-red-800" title="Deactivate"><XCircle className="h-4 w-4" /></button>}
                    {g.status==='INACTIVE' && <button onClick={() => setConfirm({open:true,id:g.id,status:'ACTIVE'})} className="text-green-600 hover:text-green-800" title="Activate"><CheckCircle className="h-4 w-4" /></button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={confirm.open} title="Change Garage Status" message={`Are you sure you want to set this garage to ${confirm.status}?`} confirmLabel="Yes, Update" onConfirm={handleStatusChange} onCancel={() => setConfirm({open:false,id:null,status:''})} />
    </div>
  );
};
export default GarageManagement;

