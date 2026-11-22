import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { LayoutDashboard, Building2, Users, BarChart3, ScrollText, Settings, UserCircle } from 'lucide-react';

const menuItems = [
  { label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
  { label: 'Garages', path: '/admin/garages', icon: Building2 },
  { label: 'Garage Owners', path: '/admin/owners', icon: Users },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Activity Logs', path: '/admin/activity-logs', icon: ScrollText },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Profile', path: '/admin/profile', icon: UserCircle },
];

const titles = { '/admin/overview': 'Dashboard Overview', '/admin/garages': 'Garage Management', '/admin/owners': 'Garage Owners', '/admin/analytics': 'Platform Analytics', '/admin/activity-logs': 'Activity Logs', '/admin/settings': 'Settings', '/admin/profile': 'My Profile' };

const AdminLayout = () => {
  const location = useLocation();
  const title = titles[location.pathname] || 'Admin Dashboard';
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} title="GearFlow" subtitle="Admin Panel" />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
};
export default AdminLayout;

