import { ChevronLeft, ChevronRight } from 'lucide-react';
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded-lg text-sm font-medium ${p === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );
};
export default Pagination;

