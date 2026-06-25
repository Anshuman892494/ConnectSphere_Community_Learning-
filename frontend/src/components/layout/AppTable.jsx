import React from 'react';
import AppLoader from '../common/AppLoader';
import EmptyState from '../common/EmptyState';

const AppTable = ({
  headers = [],
  data = [],
  renderRow,
  isLoading = false,
  emptyTitle,
  emptyMessage,
  className = '',
}) => {
  if (isLoading) {
    return <AppLoader type="spinner" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No data available'}
        message={emptyMessage || 'No matching items were found in the database.'}
      />
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-100 dark:border-darkborder shadow-sm bg-white dark:bg-darkcard ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-darkborder text-slate-500 dark:text-slate-400">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-darkborder text-slate-700 dark:text-slate-300">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppTable;
