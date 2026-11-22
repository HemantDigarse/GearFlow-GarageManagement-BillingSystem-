import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, recordPayment, getPaymentsByInvoice } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Printer, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
const InvoiceDetail = () => {
  const { id } = useParams(); const navigate = useNavigate(); const [inv, setInv] = useState(null); const [payments, setPayments] = useState([]); const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState({ open:false, amount:'', paymentMethod:'CASH', transactionReference:'', notes:'' });
  const fetch = async () => { try { const [iRes, pRes] = await Promise.all([getInvoiceById(id), getPaymentsByInvoice(id)]); setInv(iRes.data.data); setPayments(pRes.data.data||[]); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, [id]);
  const handlePayment = async () => { if (!payModal.amount || Number(payModal.amount) <= 0) return toast.error('Enter valid amount');
    try { await recordPayment({ invoiceId: Number(id), amount: Number(payModal.amount), paymentMethod: payModal.paymentMethod, transactionReference: payModal.transactionReference, notes: payModal.notes }); toast.success('Payment recorded'); setPayModal({open:false,amount:'',paymentMethod:'CASH',transactionReference:'',notes:''}); setLoading(true); fetch(); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } };
  if (loading) return <LoadingSpinner />;
  if (!inv) return <div className="text-center py-10">Not found</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print"><button onClick={() => navigate('/garage/invoices')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="flex gap-2"><button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1"><Printer className="h-4 w-4" /> Print</button>
      {inv.status !== 'PAID' && <button onClick={() => setPayModal({open:true,amount:inv.remainingBalance,paymentMethod:'CASH',transactionReference:'',notes:''})} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1"><CreditCard className="h-4 w-4" /> Record Payment</button>}</div></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-8 border-b pb-6"><div><h1 className="text-2xl font-bold text-gray-900">{inv.garageName || 'GearFlow Garage'}</h1><p className="text-sm text-gray-500 mt-1">{inv.garageAddress}</p><p className="text-sm text-gray-500">{inv.garagePhone} | {inv.garageEmail}</p></div>
        <div className="text-right"><h2 className="text-xl font-bold text-blue-600">INVOICE</h2><p className="text-sm text-gray-500 mt-1">#{inv.invoiceNumber}</p><p className="text-sm text-gray-500">{inv.invoiceDate}</p><StatusBadge status={inv.status} /></div></div>
        <div className="grid grid-cols-2 gap-8 mb-8"><div><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3><p className="font-medium">{inv.customerName}</p><p className="text-sm text-gray-500">{inv.customerMobile}</p><p className="text-sm text-gray-500">{inv.customerEmail}</p><p className="text-sm text-gray-500">{inv.customerAddress}</p></div>
        <div><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Vehicle</h3><p className="font-medium">{inv.vehicleRegNumber}</p><p className="text-sm text-gray-500">{inv.vehicleBrand} {inv.vehicleModel}</p><p className="text-sm text-gray-500">Job Card: {inv.jobCardNumber}</p></div></div>
        <table className="w-full text-sm mb-6"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Description</th><th className="px-4 py-2 text-center text-xs text-gray-500 uppercase">Qty</th><th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Price</th><th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Total</th></tr></thead>
        <tbody>{(inv.items||[]).map((it,i) => <tr key={i} className="border-b"><td className="px-4 py-2">{it.description}</td><td className="px-4 py-2 text-center">{it.quantity}</td><td className="px-4 py-2 text-right">₹{it.unitPrice}</td><td className="px-4 py-2 text-right">₹{it.totalPrice}</td></tr>)}</tbody></table>
        <div className="flex justify-end"><div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Service Charges</span><span>₹{inv.serviceCharges}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Spare Parts</span><span>₹{inv.sparePartsCharges}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Labour</span><span>₹{inv.labourCharges}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tax ({inv.taxPercentage}%)</span><span>₹{inv.taxAmount}</span></div>
          {Number(inv.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{inv.discount}</span></div>}
          <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Grand Total</span><span>₹{inv.grandTotal}</span></div>
          <div className="flex justify-between text-green-600"><span>Amount Paid</span><span>₹{inv.amountPaid}</span></div>
          <div className="flex justify-between text-red-600 font-semibold"><span>Balance Due</span><span>₹{inv.remainingBalance}</span></div>
        </div></div>
      </div>
      {payments.length > 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto no-print"><h3 className="font-semibold text-gray-900 mb-4">Payment History</h3>
      <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Method</th><th className="px-4 py-2">Reference</th></tr></thead>
      <tbody>{payments.map(p=><tr key={p.id} className="border-b"><td className="px-4 py-2">{new Date(p.paymentDate).toLocaleDateString()}</td><td className="px-4 py-2 font-medium text-green-600">₹{p.amount}</td><td className="px-4 py-2">{p.paymentMethod}</td><td className="px-4 py-2">{p.transactionReference||'-'}</td></tr>)}</tbody></table></div>}
      {payModal.open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Record Payment</h3><button onClick={() => setPayModal({...payModal,open:false})}><X className="h-5 w-5 text-gray-400"/></button></div>
        <div className="space-y-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label><input type="number" value={payModal.amount} onChange={e=>setPayModal(m=>({...m,amount:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label><select value={payModal.paymentMethod} onChange={e=>setPayModal(m=>({...m,paymentMethod:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="DEBIT_CARD">Debit Card</option><option value="CREDIT_CARD">Credit Card</option><option value="BANK_TRANSFER">Bank Transfer</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Transaction Ref</label><input value={payModal.transactionReference} onChange={e=>setPayModal(m=>({...m,transactionReference:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input value={payModal.notes} onChange={e=>setPayModal(m=>({...m,notes:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>
        <div className="flex gap-3 justify-end"><button onClick={() => setPayModal({...payModal,open:false})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-medium">Cancel</button><button onClick={handlePayment} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium">Record Payment</button></div></div></div></div>}
    </div>);
};
export default InvoiceDetail;

