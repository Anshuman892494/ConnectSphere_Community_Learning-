import React from 'react';

const AppPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-transparent border-t border-slate-200 dark:border-darkborder sm:px-6 ${className}`}>
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 dark:bg-darkcard dark:text-slate-200 dark:border-darkborder"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 dark:bg-darkcard dark:text-slate-200 dark:border-darkborder"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Showing Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-l-xl hover:bg-slate-50 disabled:opacity-40 dark:bg-darkcard dark:text-slate-400 dark:border-darkborder"
            >
              <span className="sr-only">Previous</span>
              &larr; Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'z-10 bg-primary-600 border-primary-600 text-white dark:bg-primary-600 dark:border-primary-600'
                    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50 dark:bg-darkcard dark:border-darkborder dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-r-xl hover:bg-slate-50 disabled:opacity-40 dark:bg-darkcard dark:text-slate-400 dark:border-darkborder"
            >
              <span className="sr-only">Next</span>
              Next &rarr;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AppPagination;
