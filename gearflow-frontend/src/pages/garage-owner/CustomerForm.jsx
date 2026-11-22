import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, updateCustomer, getCustomerById } from '../../services/api';
import toast from 'react-hot-toast';
const CustomerForm = () => {
  const { id } = useParams(); const navigate = useNavigate(); const isEdit = !!id;
  const [form, setForm] = useState({ name:'', mobile:'', email:'', address:'' });
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (isEdit) { (async () => { try { const res = await getCustomerById(id); const c = res.data.data; setForm({ name:c.name||'', mobile:c.mobile||'', email:c.email||'', address:c.address||'' }); } catch { toast.error('Failed to load'); } })(); } }, [id]);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.name || !form.mobile) return toast.error('Name and mobile are required'); setLoading(true);
    try { if (isEdit) { await updateCustomer(id, form); toast.success('Customer updated'); } else { await createCustomer(form); toast.success('Customer added'); } navigate('/garage/customers'); } catch(err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setLoading(false); } };
  return (
    <div className="max-w-lg mx-auto"><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit' : 'Add'} Customer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label><input type="text" value={form.mobile} onChange={e => setForm({...form, mobile:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea value={form.address} onChange={e => setForm({...form, address:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <div className="flex gap-3"><button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-60">{loading ? 'Saving...' : isEdit ? 'Update' : 'Add Customer'}</button>
        <button type="button" onClick={() => navigate('/garage/customers')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button></div>
      </form></div></div>
  );
};
export default CustomerForm;

