import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById, getVehiclesByCustomer } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Phone, Mail, MapPin, Car } from 'lucide-react';
const CustomerDetail = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [customer, setCustomer] = useState(null); const [vehicles, setVehicles] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const [cRes, vRes] = await Promise.all([getCustomerById(id), getVehiclesByCustomer(id)]); setCustomer(cRes.data.data); setVehicles(vRes.data.data || []); } catch {} finally { setLoading(false); } })(); }, [id]);
  if (loading) return <LoadingSpinner />;
  if (!customer) return <div className="text-center py-10 text-gray-500">Customer not found</div>;
  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/garage/customers')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{customer.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-gray-600"><Phone className="h-4 w-4" /> {customer.mobile}</div>
          <div className="flex items-center gap-2 text-gray-600"><Mail className="h-4 w-4" /> {customer.email || 'N/A'}</div>
          <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4" /> {customer.address || 'N/A'}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Vehicles ({vehicles.length})</h3>
        <button onClick={() => navigate('/garage/vehicles/new')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1"><Car className="h-4 w-4" /> Add Vehicle</button></div>
        {vehicles.length === 0 ? <p className="text-gray-500 text-sm">No vehicles registered</p> :
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-2">Reg No.</th><th className="px-4 py-2">Brand</th><th className="px-4 py-2">Model</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Fuel</th></tr></thead>
        <tbody>{vehicles.map(v => <tr key={v.id} className="border-b hover:bg-gray-50"><td className="px-4 py-2 font-medium">{v.registrationNumber}</td><td className="px-4 py-2">{v.brand}</td><td className="px-4 py-2">{v.model}</td><td className="px-4 py-2">{v.vehicleType}</td><td className="px-4 py-2">{v.fuelType}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
};
export default CustomerDetail;

