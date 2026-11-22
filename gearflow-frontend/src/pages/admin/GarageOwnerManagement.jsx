import { useState, useEffect } from 'react';
import { getOwners, updateOwnerStatus } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Users, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const GarageOwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, active: false });

  const fetchOwners = async () => { try { setLoading(true); const res = await getOwners(); setOwners(res.data.data || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchOwners(); }, []);

  const filtered = owners.filter(o => !search || o.fullName?.toLowerCase().includes(search.toLowerCase()) || o.email?.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = async () => { try { await updateOwnerStatus(confirm.id, confirm.active); toast.success('Status updated'); fetchOwners(); } catch { toast.error('Failed'); } finally { setConfirm({open:false,id:null,active:false}); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="w-full md:w-80"><SearchBar value={search} onChange={setSearch} placeholder="Search owners..." /></div>
      {filtered.length === 0 ? <EmptyState icon={Users} title="No owners found" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Garage</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>{filtered.map(o => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{o.fullName}</td><td className="px-4 py-3">{o.email}</td><td className="px-4 py-3">{o.phone || '-'}</td>
                <td className="px-4 py-3">{o.garageName || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={o.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                <td className="px-4 py-3"><button onClick={() => setConfirm({open:true,id:o.id,active:!o.active})} className="text-gray-600 hover:text-gray-900">
                  {o.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                </button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <ConfirmDialog isOpen={confirm.open} title="Toggle Owner Status" message={`Are you sure you want to ${confirm.active ? 'activate' : 'deactivate'} this owner?`} onConfirm={handleToggle} onCancel={() => setConfirm({open:false,id:null,active:false})} />
    </div>
  );
};
export default GarageOwnerManagement;

