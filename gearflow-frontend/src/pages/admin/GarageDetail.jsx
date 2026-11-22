import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGarageById, updateGarageStatus } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Users, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const GarageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const res = await getGarageById(id); setGarage(res.data.data); } catch { toast.error('Failed to load garage'); } finally { setLoading(false); } })(); }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!garage) return <div className="text-center py-10 text-gray-500">Garage not found</div>;

  const handleStatus = async (status) => { try { await updateGarageStatus(id, status); toast.success('Status updated'); setGarage(prev => ({ ...prev, status })); } catch { toast.error('Failed'); } };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/garages')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back to Garages</button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div><h2 className="text-2xl font-bold text-gray-900">{garage.name}</h2><p className="text-gray-500 mt-1">Owner: {garage.ownerName}</p></div>
          <div className="flex items-center gap-3"><StatusBadge status={garage.status} />
            {garage.status !== 'ACTIVE' && <button onClick={() => handleStatus('ACTIVE')} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium">Activate</button>}
            {garage.status !== 'INACTIVE' && <button onClick={() => handleStatus('INACTIVE')} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium">Deactivate</button>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Contact Info</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4" />{garage.email || 'N/A'}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" />{garage.phone || 'N/A'}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4" />{[garage.address, garage.city, garage.state].filter(Boolean).join(', ') || 'N/A'}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="h-4 w-4" />{garage.registrationDate || 'N/A'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Statistics</h3>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Customers</span><span className="font-semibold">{garage.totalCustomers || 0}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Employees</span><span className="font-semibold">{garage.totalEmployees || 0}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Job Cards</span><span className="font-semibold">{garage.totalJobCards || 0}</span></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Owner Details</h3>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-semibold">{garage.ownerName}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-semibold">{garage.ownerEmail}</span></div>
        </div>
      </div>
    </div>
  );
};
export default GarageDetail;

