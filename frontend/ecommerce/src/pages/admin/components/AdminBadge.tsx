import React from 'react';

type BadgeType = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'success' | 'warning' | 'danger' | 'info';

interface AdminBadgeProps {
  type: BadgeType | string;
  children: React.ReactNode;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ type, children }) => {
  const getStyles = () => {
    switch (type.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'success':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'pending':
      case 'warning':
      case 'shipped':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'cancelled':
      case 'failed':
      case 'danger':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStyles()}`}>
      {children}
    </span>
  );
};

export default AdminBadge;
