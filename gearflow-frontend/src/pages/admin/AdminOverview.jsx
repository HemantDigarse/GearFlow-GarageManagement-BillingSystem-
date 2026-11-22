import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, getGarages, updateGarageStatus } from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LineChartCard from '../../components/charts/LineChartCard';
import PieChartCard from '../../components/charts/PieChartCard';
import { Building2, Users, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [pendingGarages, setPendingGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, pendingResponse] = await Promise.all([
        getAdminDashboard(),
        getGarages({ status: 'PENDING' }),
      ]);
      setData(dashboardResponse.data.data);
      setPendingGarages(pendingResponse.data.data || []);
      setError(null);
    }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleApproval = async () => {
    if (!confirm) return;
    try {
      await updateGarageStatus(confirm.id, confirm.status);
      toast.success(confirm.status === 'ACTIVE' ? 'Garage approved' : 'Garage rejected');
      setConfirm(null);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update garage approval');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Garages" value={data?.totalGarages} icon={Building2} color="blue" />
        <StatsCard title="Active Garages" value={data?.activeGarages} icon={CheckCircle} color="green" />
        <StatsCard title="Inactive" value={data?.inactiveGarages} icon={XCircle} color="red" />
        <StatsCard title="Pending Approval" value={data?.pendingGarages} icon={Clock} color="yellow" />
        <StatsCard title="Total Owners" value={data?.totalOwners} icon={Users} color="purple" />
        <StatsCard title="Total Customers" value={data?.totalCustomers} icon={Users} color="emerald" />
      </div>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Garage registration approvals</h2>
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">{pendingGarages.length} pending</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Review new garage owner applications and decide whether to activate them.</p>
          </div>
          <Link to="/admin/garages?status=PENDING" className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:self-auto">
            View all applications <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {pendingGarages.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 font-medium text-gray-900">No applications are waiting</p>
            <p className="mt-1 text-sm text-gray-500">New garage registrations will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingGarages.slice(0, 5).map((garage) => (
              <div key={garage.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{garage.name}</p>
                    <StatusBadge status={garage.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Owner: {garage.ownerName || '—'} · {garage.ownerEmail || garage.email || 'No email'}</p>
                  <p className="mt-1 text-sm text-gray-500">{[garage.city, garage.state].filter(Boolean).join(', ') || 'Location not provided'} · Submitted {garage.registrationDate || '—'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/admin/garages/${garage.id}`} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Review</Link>
                  <button onClick={() => setConfirm({ id: garage.id, name: garage.name, status: 'ACTIVE' })} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => setConfirm({ id: garage.id, name: garage.name, status: 'INACTIVE' })} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard title="Monthly Registrations" data={data?.monthlyRegistrations || []} dataKey="count" xAxisKey="month" />
        <PieChartCard title="Garage Status Distribution" data={data?.garageStatusDistribution || []} dataKey="count" nameKey="status" />
      </div>
      {data?.recentGarages?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Garages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead>
              <tbody>{data.recentGarages.map((g,i) => (
                <tr key={i} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium">{g.name}</td><td className="px-4 py-3">{g.ownerName}</td><td className="px-4 py-3">{g.city}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${g.status==='ACTIVE'?'bg-green-100 text-green-700':g.status==='PENDING'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{g.status}</span></td><td className="px-4 py-3 text-gray-500">{g.registrationDate}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title={confirm?.status === 'ACTIVE' ? 'Approve garage application' : 'Reject garage application'}
        message={confirm?.status === 'ACTIVE'
          ? `Approve ${confirm?.name}? The garage owner will be able to access the garage workspace.`
          : `Reject ${confirm?.name}? The application will be marked inactive.`}
        confirmLabel={confirm?.status === 'ACTIVE' ? 'Approve garage' : 'Reject application'}
        variant={confirm?.status === 'ACTIVE' ? 'primary' : 'danger'}
        onConfirm={handleApproval}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};
export default AdminOverview;

