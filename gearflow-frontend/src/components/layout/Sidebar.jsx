import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Cog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ menuItems = [], title = 'GearFlow', subtitle = '' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-40">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Cog className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors w-full">
          <LogOut className="h-5 w-5" /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;

