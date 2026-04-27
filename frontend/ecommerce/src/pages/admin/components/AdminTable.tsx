import React from 'react';

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const AdminTable: React.FC<AdminTableProps> = ({ headers, children, className = "" }) => {
  return (
    <div className={`overflow-x-auto bg-surface rounded-2xl shadow-card border border-gray-100 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
