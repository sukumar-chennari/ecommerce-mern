interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={`w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
};

export default Input;