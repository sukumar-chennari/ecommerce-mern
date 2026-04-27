import React from 'react';

interface AdminCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, value, icon, description, trend, className = "" }) => {
  return (
    <div className={`bg-surface p-6 rounded-2xl shadow-card border border-gray-100 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-textMuted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-textPrimary mt-1">{value}</h3>
          
          {description && (
            <p className="text-xs text-textMuted mt-2">{description}</p>
          )}
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.isUp ? 'text-accent' : 'text-danger'}`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
              <span className="text-textMuted font-normal ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCard;
