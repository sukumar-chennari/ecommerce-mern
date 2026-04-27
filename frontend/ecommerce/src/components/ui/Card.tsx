import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

const Card = ({ children, className = "", onClick, noPadding = false }: CardProps) => {
  return (
    <div 
      className={`bg-surface rounded-2xl shadow-card border border-gray-100 overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/20' : ''} ${noPadding ? '' : 'p-6'} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;