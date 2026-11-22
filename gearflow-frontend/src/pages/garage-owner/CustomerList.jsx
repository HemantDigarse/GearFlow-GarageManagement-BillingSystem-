import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, deleteCustomer, searchCustomers } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Users, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({ open:false, id:null });
  const navigate = useNavigate();
  const fetchCustomers = async () => { try { setLoading(true); const res = search ? await searchCustomers(search) : await getCustomers(); setCustomers(res.data.data || []); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { const t = setTimeout(() => { if (search) fetchCustomers(); }, 500); return () => clearTimeout(t); }, [search]);
  const handleDelete = async () => { try { await deleteCustomer(confirm.id); toast.success('Customer deleted'); fetchCustomers(); } catch { toast.error('Failed'); } finally { setConfirm({open:false,id:null}); } };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-80"><SearchBar value={search} onChange={setSearch} placeholder="Search customers..." /></div>
        <button onClick={() => navigate('/garage/customers/new')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Customer</button>
      </div>
      {customers.length === 0 ? <EmptyState icon={Users} title="No customers yet" message="Add your first customer to get started" actionLabel="Add Customer" onAction={() => navigate('/garage/customers/new')} /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Mobile</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Vehicles</th><th className="px-4 py-3">Registered</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>{customers.map(c => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3">{c.mobile}</td><td className="px-4 py-3">{c.email || '-'}</td><td className="px-4 py-3">{c.vehicleCount}</td><td className="px-4 py-3 text-gray-500">{c.registrationDate}</td>
              <td className="px-4 py-3"><div className="flex gap-2">
                <button onClick={() => navigate(`/garage/customers/${c.id}`)} className="text-blue-600 hover:text-blue-800"><Eye className="h-4 w-4" /></button>
                <button onClick={() => navigate(`/garage/customers/${c.id}/edit`)} className="text-yellow-600 hover:text-yellow-800"><Edit className="h-4 w-4" /></button>
                <button onClick={() => setConfirm({open:true,id:c.id})} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>))}</tbody></table></div>
      )}
      <ConfirmDialog isOpen={confirm.open} title="Delete Customer" message="Are you sure? This action cannot be undone." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirm({open:false,id:null})} />
    </div>
  );
};
export default CustomerList;

