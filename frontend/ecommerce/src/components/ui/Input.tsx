import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isTextArea?: boolean;
}

const Input = ({ label, error, className = "", isTextArea = false, ...props }: InputProps) => {
  const baseStyles = "w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-gray-400";
  const stateStyles = error 
    ? "border-danger bg-danger/5 focus:border-danger" 
    : "border-gray-100 bg-gray-50/50 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5";

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-textMuted uppercase tracking-widest ml-1">
          {label}
        </label>
      ) }
      
      {isTextArea ? (
        <textarea
          className={`${baseStyles} ${stateStyles} resize-none ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={`${baseStyles} ${stateStyles} ${className}`}
          {...props}
        />
      )}

      {error && (
        <p className="text-[10px] font-bold text-danger uppercase tracking-tight ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;