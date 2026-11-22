import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText, Eye } from 'lucide-react';
const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState('ALL'); const navigate = useNavigate();
  useEffect(() => { (async () => { try { setLoading(true); const res = await getInvoices({ status: filter !== 'ALL' ? filter : undefined }); setInvoices(res.data.data||[]); } catch{} finally { setLoading(false); } })(); }, [filter]);
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex gap-2">{['ALL','PAID','PARTIALLY_PAID','UNPAID'].map(t=><button key={t} onClick={()=>setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.replace(/_/g,' ')}</button>)}</div>
      {invoices.length===0 ? <EmptyState icon={FileText} title="No invoices" message="Generate invoices from completed job cards" /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Invoice #</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Job Card</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
      <tbody>{invoices.map(inv=><tr key={inv.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium text-blue-600">{inv.invoiceNumber}</td><td className="px-4 py-3">{inv.customerName}</td><td className="px-4 py-3">{inv.jobCardNumber}</td><td className="px-4 py-3">{inv.invoiceDate}</td><td className="px-4 py-3 font-semibold">₹{inv.grandTotal}</td><td className="px-4 py-3 text-green-600">₹{inv.amountPaid}</td><td className="px-4 py-3 text-red-600">₹{inv.remainingBalance}</td><td className="px-4 py-3"><StatusBadge status={inv.status}/></td>
      <td className="px-4 py-3"><button onClick={() => navigate(`/garage/invoices/${inv.id}`)} className="text-blue-600"><Eye className="h-4 w-4"/></button></td></tr>)}</tbody></table></div>}
    </div>);
};
export default InvoiceList;

