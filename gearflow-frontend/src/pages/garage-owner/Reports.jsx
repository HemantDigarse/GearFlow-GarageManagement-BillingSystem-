import { useState, useEffect } from 'react';
import { getRevenueReport, getServiceReport, getPaymentReport, getEmployeeReport } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LineChartCard from '../../components/charts/LineChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import StatsCard from '../../components/common/StatsCard';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
const Reports = () => {
  const [tab, setTab] = useState('revenue'); const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { setLoading(true); let res;
    if(tab==='revenue') res = await getRevenueReport('monthly');
    else if(tab==='services') res = await getServiceReport();
    else if(tab==='payments') res = await getPaymentReport();
    else res = await getEmployeeReport();
    setData(res.data.data); } catch{} finally { setLoading(false); } })(); }, [tab]);
  return (
    <div className="space-y-6">
      <div className="flex gap-2">{[['revenue','Revenue'],['services','Services'],['payments','Payments'],['employees','Employees']].map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab===k?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>)}</div>
      {loading ? <LoadingSpinner /> : tab==='revenue' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><StatsCard title="Total Revenue" value={`₹${data?.totalRevenue||0}`} icon={DollarSign} color="emerald" /><StatsCard title="Pending Payments" value={`₹${data?.pendingPayments||0}`} icon={Clock} color="red" /><StatsCard title="Invoices" value={data?.totalInvoices||0} icon={TrendingUp} color="blue" /></div>
          <LineChartCard title="Revenue Trend" data={(data?.revenueData||[]).map(d=>({name:d.period,value:Number(d.revenue)||0}))} />
        </div>
      ) : tab==='services' ? (
        <div className="space-y-6"><BarChartCard title="Service Prices" data={(data?.services||[]).map(s=>({name:s.serviceName,value:Number(s.price)||0}))} color="#8b5cf6" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="font-semibold mb-4">Services ({data?.totalServices||0})</h3>
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-2">Service</th><th className="px-4 py-2">Price</th><th className="px-4 py-2">Status</th></tr></thead>
        <tbody>{(data?.services||[]).map((s,i)=><tr key={i} className="border-b"><td className="px-4 py-2">{s.serviceName}</td><td className="px-4 py-2">₹{s.price}</td><td className="px-4 py-2">{s.active?'Active':'Inactive'}</td></tr>)}</tbody></table></div></div>
      ) : tab==='payments' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><StatsCard title="Total Collected" value={`₹${data?.totalCollected||0}`} icon={DollarSign} color="green" /><StatsCard title="Total Pending" value={`₹${data?.totalPending||0}`} icon={Clock} color="red" /></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="font-semibold mb-4">Recent Payments</h3>
          <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Customer</th><th className="px-4 py-2">Invoice</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Method</th></tr></thead>
          <tbody>{(data?.payments||[]).map((p,i)=><tr key={i} className="border-b"><td className="px-4 py-2">{new Date(p.date).toLocaleDateString()}</td><td className="px-4 py-2">{p.customer}</td><td className="px-4 py-2">{p.invoice}</td><td className="px-4 py-2 text-green-600">₹{p.amount}</td><td className="px-4 py-2">{p.method}</td></tr>)}</tbody></table></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="font-semibold mb-4">Employee Performance</h3>
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Designation</th><th className="px-4 py-2">Assigned</th><th className="px-4 py-2">Completed</th><th className="px-4 py-2">Status</th></tr></thead>
        <tbody>{(data?.employees||[]).map((e,i)=><tr key={i} className="border-b"><td className="px-4 py-2 font-medium">{e.name}</td><td className="px-4 py-2">{e.designation}</td><td className="px-4 py-2">{e.assignedJobs}</td><td className="px-4 py-2 text-green-600">{e.completedJobs}</td><td className="px-4 py-2">{e.status}</td></tr>)}</tbody></table></div>
      )}
    </div>);
};
export default Reports;

