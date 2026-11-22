import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createVehicle, updateVehicle, getVehicleById, getCustomers } from '../../services/api';
import toast from 'react-hot-toast';
const VehicleForm = () => {
  const { id } = useParams(); const navigate = useNavigate(); const isEdit = !!id;
  const [form, setForm] = useState({ customerId:'', registrationNumber:'', brand:'', model:'', vehicleType:'Car', manufacturingYear:'', fuelType:'Petrol' });
  const [customers, setCustomers] = useState([]); const [loading, setLoading] = useState(false);
  useEffect(() => { (async () => { try { const res = await getCustomers(); setCustomers(res.data.data||[]); } catch{} })(); if(isEdit) { (async () => { try { const res = await getVehicleById(id); const v = res.data.data; setForm({ customerId:v.customerId, registrationNumber:v.registrationNumber||'', brand:v.brand||'', model:v.model||'', vehicleType:v.vehicleType||'Car', manufacturingYear:v.manufacturingYear||'', fuelType:v.fuelType||'Petrol' }); } catch{} })(); } }, [id]);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.customerId || !form.registrationNumber) return toast.error('Customer and registration number required'); setLoading(true);
    try { const data = { ...form, customerId: Number(form.customerId), manufacturingYear: form.manufacturingYear ? Number(form.manufacturingYear) : null }; if(isEdit) { await updateVehicle(id, data); toast.success('Updated'); } else { await createVehicle(data); toast.success('Vehicle added'); } navigate('/garage/vehicles'); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { setLoading(false); } };
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="max-w-lg mx-auto"><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{isEdit?'Edit':'Add'} Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label><select value={form.customerId} onChange={e=>set('customerId',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label><input value={form.registrationNumber} onChange={e=>set('registrationNumber',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Brand</label><input value={form.brand} onChange={e=>set('brand',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Model</label><input value={form.model} onChange={e=>set('model',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.vehicleType} onChange={e=>set('vehicleType',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option>Car</option><option>Bike</option><option>Truck</option><option>SUV</option><option>Van</option><option>Bus</option><option>Other</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label><select value={form.fuelType} onChange={e=>set('fuelType',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option><option>LPG</option></select></div></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year</label><input type="number" value={form.manufacturingYear} onChange={e=>set('manufacturingYear',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div className="flex gap-3"><button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-60">{loading?'Saving...':isEdit?'Update':'Add Vehicle'}</button><button type="button" onClick={() => navigate('/garage/vehicles')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button></div>
      </form></div></div>);
};
export default VehicleForm;

