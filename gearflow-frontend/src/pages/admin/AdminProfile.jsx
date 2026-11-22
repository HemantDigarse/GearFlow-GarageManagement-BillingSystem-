import { useState, useEffect } from 'react';
import { getProfile, updateProfile, changePassword } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });

  useEffect(() => { (async () => { try { const res = await getProfile(); setProfile(res.data.data); } catch {} finally { setLoading(false); } })(); }, []);

  const handleSave = async () => { try { await updateProfile({ fullName: profile.fullName, phone: profile.phone, email: profile.email }); toast.success('Profile updated'); } catch { toast.error('Failed'); } };
  const handlePw = async (e) => { e.preventDefault(); if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match'); try { await changePassword(pw); toast.success('Password changed'); setPw({currentPassword:'',newPassword:'',confirmPassword:''}); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Info</h3>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={profile?.fullName || ''} onChange={e => setProfile(p => ({...p, fullName:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={profile?.email || ''} onChange={e => setProfile(p => ({...p, email:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={profile?.phone || ''} onChange={e => setProfile(p => ({...p, phone:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">Save Changes</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePw} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" value={pw.currentPassword} onChange={e => setPw(p=>({...p,currentPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={pw.newPassword} onChange={e => setPw(p=>({...p,newPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" value={pw.confirmPassword} onChange={e => setPw(p=>({...p,confirmPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">Change Password</button>
        </form>
      </div>
    </div>
  );
};
export default AdminProfile;

