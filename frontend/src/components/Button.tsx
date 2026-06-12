import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 text-xs font-semibold rounded-lg tracking-wide transition-all duration-150 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-brand-primary hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 focus:ring-indigo-500",
    secondary: "bg-indigo-50 hover:bg-indigo-100 text-brand-primary border border-indigo-100 focus:ring-indigo-300",
    success: "bg-medical-success hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 focus:ring-emerald-500",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};