import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles, deleteVehicle } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Car, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({open:false,id:null}); const navigate = useNavigate();
  const fetch = async () => { try { setLoading(true); const res = await getVehicles(); setVehicles(res.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);
  const filtered = vehicles.filter(v => !search || v.registrationNumber?.toLowerCase().includes(search.toLowerCase()) || v.brand?.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = async () => { try { await deleteVehicle(confirm.id); toast.success('Deleted'); fetch(); } catch{ toast.error('Failed'); } finally { setConfirm({open:false,id:null}); } };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4"><div className="w-full md:w-80"><SearchBar value={search} onChange={setSearch} placeholder="Search vehicles..." /></div>
      <button onClick={() => navigate('/garage/vehicles/new')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Vehicle</button></div>
      {filtered.length===0 ? <EmptyState icon={Car} title="No vehicles" actionLabel="Add Vehicle" onAction={() => navigate('/garage/vehicles/new')} /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Reg No.</th><th className="px-4 py-3">Brand</th><th className="px-4 py-3">Model</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Fuel</th><th className="px-4 py-3">Actions</th></tr></thead>
      <tbody>{filtered.map(v=><tr key={v.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium">{v.registrationNumber}</td><td className="px-4 py-3">{v.brand}</td><td className="px-4 py-3">{v.model}</td><td className="px-4 py-3">{v.vehicleType}</td><td className="px-4 py-3">{v.customerName}</td><td className="px-4 py-3">{v.manufacturingYear}</td><td className="px-4 py-3">{v.fuelType}</td>
      <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => navigate(`/garage/vehicles/${v.id}`)} className="text-blue-600"><Eye className="h-4 w-4"/></button><button onClick={() => navigate(`/garage/vehicles/${v.id}/edit`)} className="text-yellow-600"><Edit className="h-4 w-4"/></button><button onClick={() => setConfirm({open:true,id:v.id})} className="text-red-600"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>}
      <ConfirmDialog isOpen={confirm.open} title="Delete Vehicle" message="Delete this vehicle?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirm({open:false,id:null})} />
    </div>);
};
export default VehicleList;

