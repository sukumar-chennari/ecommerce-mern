interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const Button = ({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
const base =
  "px-5 py-2 rounded-xl font-medium transition bg-primary text-white disabled:opacity-50";
const variants = {
  primary: "hover:bg-blue-700",
  secondary: "bg-secondary hover:bg-slate-800",
  danger: "bg-danger hover:bg-red-600",
};

return (
//   <button className="bg-blue-600 text-white px-4 py-2">
//   Test Button
// </button>
  <button
    className={`${base} ${variants[variant]} ${className}`}
    {...props}
  >
    {props.children}
  </button>
);
};

export default Button;
