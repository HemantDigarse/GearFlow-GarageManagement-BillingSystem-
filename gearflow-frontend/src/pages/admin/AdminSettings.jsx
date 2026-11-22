import { Settings } from 'lucide-react';
const AdminSettings = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-6"><Settings className="h-6 w-6 text-gray-400" /><h2 className="text-lg font-semibold text-gray-900">Platform Settings</h2></div>
    <div className="space-y-4 max-w-lg">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label><input type="text" defaultValue="GearFlow" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label><input type="email" defaultValue="support@gearflow.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" /></div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">Save Settings</button>
    </div>
  </div>
);
export default AdminSettings;

