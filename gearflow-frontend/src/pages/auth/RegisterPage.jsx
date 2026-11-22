import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Cog } from 'lucide-react';
import toast from 'react-hot-toast';

const Field = ({ label, name, type = 'text', required = false, placeholder, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoComplete={name === 'confirmPassword' ? 'new-password' : name}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
    />
  </div>
);

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName:'', username:'', email:'', password:'', confirmPassword:'', phone:'', garageName:'', garageAddress:'', garageCity:'', garageState:'', garagePhone:'', garageEmail:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const field = (name) => (value) => set(name, value);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6"><div className="inline-flex items-center gap-2 mb-1"><Cog className="h-8 w-8 text-white" /><h1 className="text-2xl font-bold text-white">GearFlow</h1></div><p className="text-blue-200 text-sm">Register your garage</p></div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Garage Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" name="fullName" required placeholder="John Doe" value={form.fullName} onChange={e => field('fullName')(e.target.value)} />
            <Field label="Username" name="username" required placeholder="johndoe" value={form.username} onChange={e => field('username')(e.target.value)} />
            <Field label="Email" name="email" type="email" required placeholder="john@example.com" value={form.email} onChange={e => field('email')(e.target.value)} />
            <Field label="Phone" name="phone" placeholder="9876543210" value={form.phone} onChange={e => field('phone')(e.target.value)} />
            <Field label="Password" name="password" type="password" required placeholder="Min 6 characters" value={form.password} onChange={e => field('password')(e.target.value)} />
            <Field label="Confirm Password" name="confirmPassword" type="password" required placeholder="Re-enter password" value={form.confirmPassword} onChange={e => field('confirmPassword')(e.target.value)} />
          </div>
          <hr className="border-gray-200" />
          <h3 className="text-lg font-semibold text-gray-800">Garage Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Garage Name" name="garageName" placeholder="My Auto Garage" value={form.garageName} onChange={e => field('garageName')(e.target.value)} />
            <Field label="Garage Email" name="garageEmail" type="email" placeholder="garage@example.com" value={form.garageEmail} onChange={e => field('garageEmail')(e.target.value)} />
            <Field label="Garage Phone" name="garagePhone" placeholder="9876543210" value={form.garagePhone} onChange={e => field('garagePhone')(e.target.value)} />
            <Field label="City" name="garageCity" placeholder="Mumbai" value={form.garageCity} onChange={e => field('garageCity')(e.target.value)} />
            <Field label="State" name="garageState" placeholder="Maharashtra" value={form.garageState} onChange={e => field('garageState')(e.target.value)} />
            <div className="md:col-span-2"><Field label="Address" name="garageAddress" placeholder="123, Main Street" value={form.garageAddress} onChange={e => field('garageAddress')(e.target.value)} /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60">{loading ? 'Registering...' : 'Register Garage'}</button>
          <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;

