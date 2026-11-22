import { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, toggleEmployeeStatus } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { UserCheck, Plus, Edit, ToggleLeft, ToggleRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open:false, id:null, name:'', mobile:'', email:'', designation:'', salary:'', joiningDate:'' });
  const fetch = async () => { try { setLoading(true); const res = await getEmployees(); setEmployees(res.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);
  const handleSave = async () => { if (!modal.name || !modal.mobile) return toast.error('Name and mobile required');
    try { const data = { name:modal.name, mobile:modal.mobile, email:modal.email, designation:modal.designation, salary:modal.salary?Number(modal.salary):null, joiningDate:modal.joiningDate||null };
      if (modal.id) { await updateEmployee(modal.id, data); toast.success('Updated'); } else { await createEmployee(data); toast.success('Employee added'); }
      setModal({open:false,id:null,name:'',mobile:'',email:'',designation:'',salary:'',joiningDate:''}); fetch(); } catch { toast.error('Failed'); } };
  const handleToggle = async (id) => { try { await toggleEmployeeStatus(id); toast.success('Status toggled'); fetch(); } catch { toast.error('Failed'); } };
  const openEdit = (e) => setModal({open:true, id:e.id, name:e.name, mobile:e.mobile, email:e.email||'', designation:e.designation||'', salary:e.salary||'', joiningDate:e.joiningDate||''});
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex justify-end"><button onClick={() => setModal({open:true,id:null,name:'',mobile:'',email:'',designation:'',salary:'',joiningDate:''})} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Employee</button></div>
      {employees.length===0 ? <EmptyState icon={UserCheck} title="No employees" actionLabel="Add Employee" onAction={() => setModal({open:true,id:null,name:'',mobile:'',email:'',designation:'',salary:'',joiningDate:''})} /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Mobile</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Salary</th><th className="px-4 py-3">Jobs</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
      <tbody>{employees.map(e=><tr key={e.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium">{e.name}</td><td className="px-4 py-3">{e.mobile}</td><td className="px-4 py-3">{e.email||'-'}</td><td className="px-4 py-3">{e.designation||'-'}</td><td className="px-4 py-3">{e.salary ? `₹${e.salary}` : '-'}</td><td className="px-4 py-3"><span className="text-blue-600">{e.assignedJobs}</span>/<span className="text-green-600">{e.completedJobs}</span></td><td className="px-4 py-3"><StatusBadge status={e.status} /></td>
      <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEdit(e)} className="text-yellow-600"><Edit className="h-4 w-4"/></button><button onClick={() => handleToggle(e.id)} className="text-gray-600">{e.status==='ACTIVE'?<ToggleRight className="h-5 w-5 text-green-600"/>:<ToggleLeft className="h-5 w-5"/>}</button></div></td></tr>)}</tbody></table></div>}
      {modal.open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{modal.id?'Edit':'Add'} Employee</h3><button onClick={() => setModal({...modal,open:false})}><X className="h-5 w-5 text-gray-400"/></button></div>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={modal.name} onChange={e=>setModal(m=>({...m,name:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label><input value={modal.mobile} onChange={e=>setModal(m=>({...m,mobile:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={modal.email} onChange={e=>setModal(m=>({...m,email:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Designation</label><input value={modal.designation} onChange={e=>setModal(m=>({...m,designation:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Mechanic" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Salary</label><input type="number" value={modal.salary} onChange={e=>setModal(m=>({...m,salary:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label><input type="date" value={modal.joiningDate} onChange={e=>setModal(m=>({...m,joiningDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div className="flex gap-3 justify-end"><button onClick={() => setModal({...modal,open:false})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button><button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium">Save</button></div></div></div></div>}
    </div>);
};
export default EmployeeList;

