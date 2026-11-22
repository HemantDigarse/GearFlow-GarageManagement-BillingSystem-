import { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BarChartCard from '../../components/charts/BarChartCard';
import StatsCard from '../../components/common/StatsCard';
import { DollarSign, Building2, Users } from 'lucide-react';

const PlatformAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const res = await getAdminAnalytics(); setData(res.data.data); } catch {} finally { setLoading(false); } })(); }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Revenue" value={`₹${data?.totalRevenue || 0}`} icon={DollarSign} color="emerald" />
        <StatsCard title="Total Garages" value={data?.totalGarages || 0} icon={Building2} color="blue" />
        <StatsCard title="Total Customers" value={data?.totalCustomers || 0} icon={Users} color="purple" />
      </div>
      <BarChartCard title="Garage-wise Revenue" data={(data?.garageRevenue || []).map(g => ({ name: g.garageName, value: Number(g.revenue) || 0 }))} />
    </div>
  );
};
export default PlatformAnalytics;

