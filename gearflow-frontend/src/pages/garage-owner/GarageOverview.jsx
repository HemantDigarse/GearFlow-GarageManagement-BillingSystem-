import { useState, useEffect } from 'react';
import { getGarageDashboard } from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import LineChartCard from '../../components/charts/LineChartCard';
import PieChartCard from '../../components/charts/PieChartCard';
import { Users, Car, Wrench, Calendar, Clock, Loader, CheckCircle, DollarSign } from 'lucide-react';

const GarageOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchData = async () => { try { setLoading(true); const res = await getGarageDashboard(); setData(res.data.data); setError(null); } catch(e) { setError(e.message); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Customers" value={data?.totalCustomers} icon={Users} color="blue" />
        <StatsCard title="Vehicles" value={data?.totalVehicles} icon={Car} color="green" />
        <StatsCard title="Services" value={data?.totalServices} icon={Wrench} color="purple" />
        <StatsCard title="Today's Appointments" value={data?.todayAppointments} icon={Calendar} color="amber" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Jobs" value={data?.pendingJobs} icon={Clock} color="yellow" />
        <StatsCard title="In Progress" value={data?.inProgressJobs} icon={Loader} color="blue" />
        <StatsCard title="Completed" value={data?.completedJobs} icon={CheckCircle} color="green" />
        <StatsCard title="Revenue" value={`₹${data?.totalRevenue || 0}`} icon={DollarSign} color="emerald" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard title="Monthly Revenue" data={data?.monthlyRevenue || []} dataKey="revenue" xAxisKey="month" />
        <PieChartCard title="Job Status Distribution" data={(data?.jobStatusDistribution || []).filter(d => d.count > 0)} dataKey="count" nameKey="status" />
      </div>
    </div>
  );
};
export default GarageOverview;

