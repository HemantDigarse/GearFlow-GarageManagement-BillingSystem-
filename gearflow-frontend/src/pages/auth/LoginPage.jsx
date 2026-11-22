import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Cog, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const role = await login(form);
      toast.success('Welcome back!');
      navigate(role === 'ADMIN' ? '/admin/overview' : '/garage/overview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2"><Cog className="h-10 w-10 text-white" /><h1 className="text-3xl font-bold text-white">GearFlow</h1></div>
          <p className="text-blue-200">Garage Maintenance & Billing Management</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Sign In</h2>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" required value={form.username} onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10" placeholder="Enter password" />
              <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(prev => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Register here</Link></p>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;

