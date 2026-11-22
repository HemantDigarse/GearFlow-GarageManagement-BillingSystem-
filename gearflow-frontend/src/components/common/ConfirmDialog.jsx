import { X } from 'lucide-react';
const ConfirmDialog = ({ isOpen, title = 'Confirm', message, confirmLabel = 'Confirm', onConfirm, onCancel, variant = 'danger' }) => {
  if (!isOpen) return null;
  const btnClass = variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${btnClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDialog;

