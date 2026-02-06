interface CardProps {
  children: React.ReactNode;
}

const Card = ({ children }: CardProps) => {
  return (
    <div className="bg-surface rounded-2xl shadow-card p-6">
      {children}
    </div>
  );
};

export default Card;