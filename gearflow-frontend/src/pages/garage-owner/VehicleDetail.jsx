import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Car } from 'lucide-react';
const VehicleDetail = () => {
  const { id } = useParams(); const navigate = useNavigate(); const [v, setV] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const res = await getVehicleById(id); setV(res.data.data); } catch{} finally { setLoading(false); } })(); }, [id]);
  if (loading) return <LoadingSpinner />;
  if (!v) return <div className="text-center py-10 text-gray-500">Vehicle not found</div>;
  return (<div className="space-y-6"><button onClick={() => navigate('/garage/vehicles')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</button>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><div className="flex items-center gap-3 mb-4"><Car className="h-6 w-6 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">{v.registrationNumber}</h2></div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">{[['Brand',v.brand],['Model',v.model],['Type',v.vehicleType],['Year',v.manufacturingYear],['Fuel',v.fuelType],['Customer',v.customerName],['Last Service',v.lastServiceDate||'N/A']].map(([l,val])=>
    <div key={l}><span className="text-gray-500">{l}</span><p className="font-medium text-gray-900">{val||'N/A'}</p></div>)}</div></div></div>);
};
export default VehicleDetail;

