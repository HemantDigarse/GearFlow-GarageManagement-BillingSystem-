import { useState } from 'react';
import { changePassword } from '../../services/api';
import { Settings, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
const GarageSettings = () => {
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const handlePw = async (e) => { e.preventDefault(); if (!pw.currentPassword || !pw.newPassword) return toast.error('Fill all fields');
    if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match');
    try { await changePassword(pw); toast.success('Password changed'); setPw({currentPassword:'',newPassword:'',confirmPassword:''}); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } };
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6"><Lock className="h-5 w-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900">Change Password</h3></div>
        <form onSubmit={handlePw} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" value={pw.currentPassword} onChange={e=>setPw(p=>({...p,currentPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={pw.newPassword} onChange={e=>setPw(p=>({...p,newPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label><input type="password" value={pw.confirmPassword} onChange={e=>setPw(p=>({...p,confirmPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">Change Password</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4"><Settings className="h-5 w-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900">Invoice Settings</h3></div>
        <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label><input type="number" defaultValue="18" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label><input defaultValue="Due upon receipt" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium">Save Settings</button></div>
      </div>
    </div>);
};
export default GarageSettings;

