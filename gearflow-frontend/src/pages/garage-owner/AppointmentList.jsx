import { useState, useEffect } from 'react';
import { getAppointments, getTodayAppointments, createAppointment, updateAppointmentStatus, getCustomers, getVehiclesByCustomer } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
const AppointmentList = () => {
  const [appts, setAppts] = useState([]); const [loading, setLoading] = useState(true); const [tab, setTab] = useState('ALL');
  const [modal, setModal] = useState({ open:false, customerId:'', vehicleId:'', appointmentDate:'', appointmentTime:'', serviceDescription:'', notes:'' });
  const [customers, setCustomers] = useState([]); const [vehicles, setVehicles] = useState([]);
  const fetch = async () => { try { setLoading(true); const res = tab === 'TODAY' ? await getTodayAppointments() : await getAppointments(); setAppts(res.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, [tab]);
  useEffect(() => { (async () => { try { const res = await getCustomers(); setCustomers(res.data.data||[]); } catch{} })(); }, []);
  useEffect(() => { if(modal.customerId) { (async () => { try { const res = await getVehiclesByCustomer(modal.customerId); setVehicles(res.data.data||[]); } catch{} })(); } }, [modal.customerId]);
  const handleSave = async () => { if(!modal.customerId || !modal.appointmentDate) return toast.error('Customer and date required');
    try { await createAppointment({ customerId:Number(modal.customerId), vehicleId:modal.vehicleId?Number(modal.vehicleId):null, appointmentDate:modal.appointmentDate, appointmentTime:modal.appointmentTime||null, serviceDescription:modal.serviceDescription, notes:modal.notes }); toast.success('Appointment created'); setModal({open:false,customerId:'',vehicleId:'',appointmentDate:'',appointmentTime:'',serviceDescription:'',notes:''}); fetch(); } catch { toast.error('Failed'); } };
  const handleStatus = async (id, status) => { try { await updateAppointmentStatus(id, status); toast.success('Updated'); fetch(); } catch { toast.error('Failed'); } };
  const filtered = tab === 'ALL' || tab === 'TODAY' ? appts : appts.filter(a => a.status === tab);
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-wrap">{['ALL','TODAY','SCHEDULED','CONFIRMED','COMPLETED','CANCELLED'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>)}</div>
        <button onClick={() => setModal({open:true,customerId:'',vehicleId:'',appointmentDate:'',appointmentTime:'',serviceDescription:'',notes:''})} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> New Appointment</button>
      </div>
      {filtered.length===0 ? <EmptyState icon={Calendar} title="No appointments" /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
      <tbody>{filtered.map(a=><tr key={a.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium">{a.customerName}</td><td className="px-4 py-3">{a.vehicleRegNumber||'-'}</td><td className="px-4 py-3">{a.appointmentDate}</td><td className="px-4 py-3">{a.appointmentTime||'-'}</td><td className="px-4 py-3 max-w-[200px] truncate">{a.serviceDescription||'-'}</td><td className="px-4 py-3"><StatusBadge status={a.status}/></td>
      <td className="px-4 py-3"><select onChange={e=>{if(e.target.value) handleStatus(a.id, e.target.value); e.target.value='';}} className="text-xs border rounded px-2 py-1" defaultValue=""><option value="">Change Status</option>{['CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW'].filter(s=>s!==a.status).map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></td></tr>)}</tbody></table></div>}
      {modal.open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">New Appointment</h3><button onClick={() => setModal({...modal,open:false})}><X className="h-5 w-5 text-gray-400"/></button></div>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label><select value={modal.customerId} onChange={e=>setModal(m=>({...m,customerId:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="">Select</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label><select value={modal.vehicleId} onChange={e=>setModal(m=>({...m,vehicleId:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="">Select</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.registrationNumber}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={modal.appointmentDate} onChange={e=>setModal(m=>({...m,appointmentDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input type="time" value={modal.appointmentTime} onChange={e=>setModal(m=>({...m,appointmentTime:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label><textarea value={modal.serviceDescription} onChange={e=>setModal(m=>({...m,serviceDescription:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div className="flex gap-3 justify-end"><button onClick={() => setModal({...modal,open:false})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button><button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium">Create</button></div></div></div></div>}
    </div>);
};
export default AppointmentList;

