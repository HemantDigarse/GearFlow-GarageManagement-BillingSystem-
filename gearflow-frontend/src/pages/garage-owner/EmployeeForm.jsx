import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, updateEmployee, getEmployeeById } from '../../services/api';
import toast from 'react-hot-toast';
const EmployeeForm = () => {
  const { id } = useParams(); const navigate = useNavigate(); const isEdit = !!id;
  const [form, setForm] = useState({ name:'', mobile:'', email:'', designation:'', salary:'', joiningDate:'' });
  const [loading, setLoading] = useState(false);
  useEffect(() => { if(isEdit) { (async () => { try { const res = await getEmployeeById(id); const e = res.data.data; setForm({ name:e.name||'', mobile:e.mobile||'', email:e.email||'', designation:e.designation||'', salary:e.salary||'', joiningDate:e.joiningDate||'' }); } catch{} })(); } }, [id]);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.name || !form.mobile) return toast.error('Name and mobile required'); setLoading(true);
    try { const data = { ...form, salary: form.salary ? Number(form.salary) : null, joiningDate: form.joiningDate || null }; if(isEdit) { await updateEmployee(id, data); toast.success('Updated'); } else { await createEmployee(data); toast.success('Added'); } navigate('/garage/employees'); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { setLoading(false); } };
  return (
    <div className="max-w-lg mx-auto"><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{isEdit?'Edit':'Add'} Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label><input value={form.mobile} onChange={e=>set('mobile',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Designation</label><input value={form.designation} onChange={e=>set('designation',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Salary</label><input type="number" value={form.salary} onChange={e=>set('salary',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label><input type="date" value={form.joiningDate} onChange={e=>set('joiningDate',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div className="flex gap-3"><button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-60">{loading?'Saving...':'Save'}</button><button type="button" onClick={() => navigate('/garage/employees')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button></div>
      </form></div></div>);
};
export default EmployeeForm;

