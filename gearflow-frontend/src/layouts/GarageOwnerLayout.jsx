import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { LayoutDashboard, Users, Car, Wrench, ClipboardList, UserCheck, Calendar, FileText, CreditCard, BarChart3, Building2, Settings } from 'lucide-react';

const menuItems = [
  { label: 'Overview', path: '/garage/overview', icon: LayoutDashboard },
  { label: 'Customers', path: '/garage/customers', icon: Users },
  { label: 'Vehicles', path: '/garage/vehicles', icon: Car },
  { label: 'Services', path: '/garage/services', icon: Wrench },
  { label: 'Job Cards', path: '/garage/job-cards', icon: ClipboardList },
  { label: 'Employees', path: '/garage/employees', icon: UserCheck },
  { label: 'Appointments', path: '/garage/appointments', icon: Calendar },
  { label: 'Invoices', path: '/garage/invoices', icon: FileText },
  { label: 'Payments', path: '/garage/payments', icon: CreditCard },
  { label: 'Reports', path: '/garage/reports', icon: BarChart3 },
  { label: 'Garage Profile', path: '/garage/profile', icon: Building2 },
  { label: 'Settings', path: '/garage/settings', icon: Settings },
];

const titles = { '/garage/overview':'Dashboard', '/garage/customers':'Customers', '/garage/vehicles':'Vehicles', '/garage/services':'Services', '/garage/job-cards':'Job Cards', '/garage/employees':'Employees', '/garage/appointments':'Appointments', '/garage/invoices':'Invoices', '/garage/payments':'Payments', '/garage/reports':'Reports', '/garage/profile':'Garage Profile', '/garage/settings':'Settings' };

const GarageOwnerLayout = () => {
  const location = useLocation();
  const title = Object.entries(titles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'Dashboard';
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} title="GearFlow" subtitle="Garage Panel" />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
};
export default GarageOwnerLayout;

