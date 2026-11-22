import { useState, useEffect } from 'react';
import { getServices, createService, updateService, toggleServiceStatus } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Wrench, Plus, Edit, ToggleLeft, ToggleRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
const ServiceList = () => {
  const [services, setServices] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open:false, id:null, name:'', description:'', price:'' });
  const fetch = async () => { try { setLoading(true); const res = await getServices(); setServices(res.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);
  const handleSave = async () => { if (!modal.name || !modal.price) return toast.error('Name and price required');
    try { const data = { name: modal.name, description: modal.description, price: Number(modal.price) };
      if (modal.id) { await updateService(modal.id, data); toast.success('Updated'); } else { await createService(data); toast.success('Service added'); }
      setModal({ open:false, id:null, name:'', description:'', price:'' }); fetch(); } catch { toast.error('Failed'); } };
  const handleToggle = async (id) => { try { await toggleServiceStatus(id); toast.success('Status toggled'); fetch(); } catch { toast.error('Failed'); } };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex justify-end"><button onClick={() => setModal({open:true,id:null,name:'',description:'',price:''})} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Service</button></div>
      {services.length===0 ? <EmptyState icon={Wrench} title="No services" actionLabel="Add Service" onAction={() => setModal({open:true,id:null,name:'',description:'',price:''})} /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
      <tbody>{services.map(s=><tr key={s.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3 text-gray-500">{s.description||'-'}</td><td className="px-4 py-3">₹{s.price}</td><td className="px-4 py-3"><StatusBadge status={s.active?'ACTIVE':'INACTIVE'} /></td>
      <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => setModal({open:true,id:s.id,name:s.name,description:s.description||'',price:s.price})} className="text-yellow-600"><Edit className="h-4 w-4"/></button><button onClick={() => handleToggle(s.id)} className="text-gray-600">{s.active?<ToggleRight className="h-5 w-5 text-green-600"/>:<ToggleLeft className="h-5 w-5"/>}</button></div></td></tr>)}</tbody></table></div>}
      {modal.open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{modal.id?'Edit':'Add'} Service</h3><button onClick={() => setModal({...modal,open:false})}><X className="h-5 w-5 text-gray-400"/></button></div>
        <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={modal.name} onChange={e=>setModal(m=>({...m,name:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input value={modal.description} onChange={e=>setModal(m=>({...m,description:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label><input type="number" value={modal.price} onChange={e=>setModal(m=>({...m,price:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div className="flex gap-3 justify-end"><button onClick={() => setModal({...modal,open:false})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button><button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium">Save</button></div></div></div></div>}
    </div>);
};
export default ServiceList;

