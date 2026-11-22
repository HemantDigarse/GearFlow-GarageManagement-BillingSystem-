import { useState, useEffect } from 'react';
import { getPayments, recordPayment, getInvoices } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatsCard from '../../components/common/StatsCard';
import { CreditCard, DollarSign, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
const PaymentList = () => {
  const [payments, setPayments] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open:false, invoiceId:'', amount:'', paymentMethod:'CASH', transactionReference:'', notes:'' });
  const [invoices, setInvoices] = useState([]);
  const fetch = async () => { try { setLoading(true); const res = await getPayments(); setPayments(res.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);
  const totalReceived = payments.reduce((s,p)=>s+Number(p.amount), 0);
  const openModal = async () => { try { const res = await getInvoices({status:'UNPAID'}); const partial = await getInvoices({status:'PARTIALLY_PAID'}); setInvoices([...(res.data.data||[]), ...(partial.data.data||[])]); } catch{} setModal({open:true,invoiceId:'',amount:'',paymentMethod:'CASH',transactionReference:'',notes:''}); };
  const handleSave = async () => { if(!modal.invoiceId||!modal.amount) return toast.error('Invoice and amount required');
    try { await recordPayment({invoiceId:Number(modal.invoiceId), amount:Number(modal.amount), paymentMethod:modal.paymentMethod, transactionReference:modal.transactionReference, notes:modal.notes}); toast.success('Payment recorded'); setModal({...modal,open:false}); fetch(); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><StatsCard title="Total Received" value={`₹${totalReceived.toFixed(2)}`} icon={DollarSign} color="green" /><StatsCard title="Transactions" value={payments.length} icon={CreditCard} color="blue" /></div>
      <div className="flex justify-end"><button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Record Payment</button></div>
      {payments.length===0 ? <EmptyState icon={CreditCard} title="No payments" /> :
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Reference</th></tr></thead>
      <tbody>{payments.map(p=><tr key={p.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3">{new Date(p.paymentDate).toLocaleDateString()}</td><td className="px-4 py-3">{p.customerName}</td><td className="px-4 py-3 text-blue-600">{p.invoiceNumber}</td><td className="px-4 py-3 font-semibold text-green-600">₹{p.amount}</td><td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{p.paymentMethod?.replace(/_/g,' ')}</span></td><td className="px-4 py-3">{p.transactionReference||'-'}</td></tr>)}</tbody></table></div>}
      {modal.open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Record Payment</h3><button onClick={() => setModal({...modal,open:false})}><X className="h-5 w-5 text-gray-400"/></button></div>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label><select value={modal.invoiceId} onChange={e=>setModal(m=>({...m,invoiceId:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="">Select invoice</option>{invoices.map(i=><option key={i.id} value={i.id}>{i.invoiceNumber} - {i.customerName} (₹{i.remainingBalance} due)</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label><input type="number" value={modal.amount} onChange={e=>setModal(m=>({...m,amount:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Method</label><select value={modal.paymentMethod} onChange={e=>setModal(m=>({...m,paymentMethod:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="DEBIT_CARD">Debit Card</option><option value="CREDIT_CARD">Credit Card</option><option value="BANK_TRANSFER">Bank Transfer</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Reference</label><input value={modal.transactionReference} onChange={e=>setModal(m=>({...m,transactionReference:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
          <div className="flex gap-3 justify-end"><button onClick={() => setModal({...modal,open:false})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button><button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium">Record</button></div></div></div></div>}
    </div>);
};
export default PaymentList;

