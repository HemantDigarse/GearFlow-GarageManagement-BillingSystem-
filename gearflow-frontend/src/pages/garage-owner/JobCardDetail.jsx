import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobCardById, updateJobCardStatus, generateInvoice } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
const JobCardDetail = () => {
  const { id } = useParams(); const navigate = useNavigate(); const [jc, setJc] = useState(null); const [loading, setLoading] = useState(true);
  const fetch = async () => { try { const res = await getJobCardById(id); setJc(res.data.data); } catch{} finally { setLoading(false); } };
  useEffect(() => { fetch(); }, [id]);
  const handleStatus = async (status) => { try { await updateJobCardStatus(id, status); toast.success('Status updated'); fetch(); } catch { toast.error('Failed'); } };
  const handleGenerateInvoice = async () => { try { const res = await generateInvoice(id, { sparePartsCharges:0, labourCharges:0, taxPercentage:18, discount:0 }); toast.success('Invoice generated'); navigate(`/garage/invoices/${res.data.data.id}`); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } };
  if (loading) return <LoadingSpinner />;
  if (!jc) return <div className="text-center py-10">Not found</div>;
  const statuses = ['CREATED','PENDING','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED'];
  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/garage/job-cards')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div><h2 className="text-2xl font-bold text-gray-900">{jc.jobCardNumber}</h2><div className="flex gap-2 mt-2"><StatusBadge status={jc.status} /><StatusBadge status={jc.priority} /></div></div>
          <div className="flex gap-2 flex-wrap">
            {jc.status === 'COMPLETED' && <button onClick={handleGenerateInvoice} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1"><FileText className="h-4 w-4" /> Generate Invoice</button>}
            {statuses.filter(s => s !== jc.status).map(s => <button key={s} onClick={() => handleStatus(s)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium">{s.replace(/_/g,' ')}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2"><h3 className="font-semibold text-gray-900 text-sm">Customer</h3><p>{jc.customerName}</p><p className="text-sm text-gray-500">{jc.customerMobile}</p></div>
          <div className="space-y-2"><h3 className="font-semibold text-gray-900 text-sm">Vehicle</h3><p>{jc.vehicleRegNumber}</p><p className="text-sm text-gray-500">{jc.vehicleBrand} {jc.vehicleModel}</p></div>
          <div className="space-y-2"><h3 className="font-semibold text-gray-900 text-sm">Assigned To</h3><p>{jc.assignedEmployeeName || 'Unassigned'}</p><p className="text-sm text-gray-500">Est. Completion: {jc.estimatedCompletionDate || 'N/A'}</p></div>
        </div>
        {jc.problemDescription && <div className="mt-4"><h3 className="font-semibold text-gray-900 text-sm mb-1">Problem</h3><p className="text-gray-600 text-sm">{jc.problemDescription}</p></div>}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-2">Service</th><th className="px-4 py-2">Qty</th><th className="px-4 py-2">Unit Price</th><th className="px-4 py-2">Total</th></tr></thead>
        <tbody>{(jc.items||[]).map((item,i)=><tr key={i} className="border-b"><td className="px-4 py-2">{item.serviceName}</td><td className="px-4 py-2">{item.quantity}</td><td className="px-4 py-2">₹{item.unitPrice}</td><td className="px-4 py-2">₹{item.totalPrice}</td></tr>)}</tbody>
        <tfoot><tr className="font-bold"><td colSpan="3" className="px-4 py-3 text-right">Total Amount:</td><td className="px-4 py-3">₹{jc.totalAmount || 0}</td></tr></tfoot></table>
      </div>
    </div>);
};
export default JobCardDetail;

