import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJobCard, getCustomers, getVehiclesByCustomer, getServices, getEmployees } from '../../services/api';
import toast from 'react-hot-toast';
const JobCardForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]); const [vehicles, setVehicles] = useState([]); const [services, setServices] = useState([]); const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ customerId:'', vehicleId:'', problemDescription:'', assignedEmployeeId:'', estimatedCompletionDate:'', priority:'MEDIUM', notes:'', selectedServices:[] });
  const [loading, setLoading] = useState(false);
  useEffect(() => { (async () => { try { const [c,s,e] = await Promise.all([getCustomers(), getServices(), getEmployees()]); setCustomers(c.data.data||[]); setServices((s.data.data||[]).filter(sv=>sv.active)); setEmployees(e.data.data||[]); } catch{} })(); }, []);
  useEffect(() => { if (form.customerId) { (async () => { try { const res = await getVehiclesByCustomer(form.customerId); setVehicles(res.data.data||[]); } catch{} })(); } else { setVehicles([]); } }, [form.customerId]);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const toggleService = (svc) => { setForm(p => { const exists = p.selectedServices.find(s => s.serviceId === svc.id); if (exists) return { ...p, selectedServices: p.selectedServices.filter(s => s.serviceId !== svc.id) }; return { ...p, selectedServices: [...p.selectedServices, { serviceId: svc.id, name: svc.name, price: svc.price, quantity: 1 }] }; }); };
  const setQty = (serviceId, qty) => { setForm(p => ({ ...p, selectedServices: p.selectedServices.map(s => s.serviceId === serviceId ? { ...s, quantity: Number(qty) || 1 } : s) })); };
  const total = form.selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.customerId || !form.vehicleId) return toast.error('Select customer and vehicle'); setLoading(true);
    try { await createJobCard({ customerId: Number(form.customerId), vehicleId: Number(form.vehicleId), problemDescription: form.problemDescription, assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null, estimatedCompletionDate: form.estimatedCompletionDate || null, priority: form.priority, notes: form.notes, items: form.selectedServices.map(s => ({ serviceId: s.serviceId, quantity: s.quantity })) });
    toast.success('Job card created'); navigate('/garage/job-cards'); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { setLoading(false); } };
  return (
    <div className="max-w-2xl mx-auto"><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">New Job Card</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label><select value={form.customerId} onChange={e=>set('customerId',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="">Select customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label><select value={form.vehicleId} onChange={e=>set('vehicleId',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" disabled={!form.customerId}><option value="">Select vehicle</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.registrationNumber} - {v.brand} {v.model}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label><textarea value={form.problemDescription} onChange={e=>set('problemDescription',e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Select Services</label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">{services.map(s=>{const sel=form.selectedServices.find(ss=>ss.serviceId===s.id); return(
          <div key={s.id} className="flex items-center gap-3"><input type="checkbox" checked={!!sel} onChange={()=>toggleService(s)} className="rounded"/><span className="flex-1 text-sm">{s.name}</span><span className="text-sm text-gray-500">₹{s.price}</span>{sel&&<input type="number" min="1" value={sel.quantity} onChange={e=>setQty(s.id,e.target.value)} className="w-16 px-2 py-1 border rounded text-sm"/>}</div>);})}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign Employee</label><select value={form.assignedEmployeeId} onChange={e=>set('assignedEmployeeId',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="">Unassigned</option>{employees.filter(e=>e.status==='ACTIVE').map(e=><option key={e.id} value={e.id}>{e.name} - {e.designation}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={form.priority} onChange={e=>set('priority',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Completion</label><input type="date" value={form.estimatedCompletionDate} onChange={e=>set('estimatedCompletionDate',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div className="bg-gray-50 rounded-lg p-4 text-right"><span className="text-lg font-bold text-gray-900">Total: ₹{total.toFixed(2)}</span></div>
        <div className="flex gap-3"><button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-60">{loading?'Creating...':'Create Job Card'}</button><button type="button" onClick={() => navigate('/garage/job-cards')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button></div>
      </form></div></div>);
};
export default JobCardForm;

