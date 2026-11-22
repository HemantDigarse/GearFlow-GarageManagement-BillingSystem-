import { useState, useEffect } from 'react';
import { getProfile, updateGarageProfile } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
const GarageProfile = () => {
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const res = await getProfile(); setProfile(res.data.data); } catch{} finally { setLoading(false); } })(); }, []);
  const set = (k,v) => setProfile(p=>({...p,[k]:v}));
  const handleSave = async () => { try { await updateGarageProfile({ name:profile.garageName, email:profile.garageEmail, phone:profile.garagePhone, address:profile.garageAddress, city:profile.garageCity, state:profile.garageState }); toast.success('Profile updated'); } catch { toast.error('Failed'); } };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="max-w-2xl mx-auto"><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6"><Building2 className="h-6 w-6 text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Garage Profile</h2></div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Garage Name</label><input value={profile?.garageName||''} onChange={e=>set('garageName',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={profile?.garageEmail||''} onChange={e=>set('garageEmail',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={profile?.garagePhone||''} onChange={e=>set('garagePhone',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input value={profile?.garageCity||''} onChange={e=>set('garageCity',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input value={profile?.garageState||''} onChange={e=>set('garageState',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea value={profile?.garageAddress||''} onChange={e=>set('garageAddress',e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">Save Changes</button>
      </div></div></div>);
};
export default GarageProfile;

