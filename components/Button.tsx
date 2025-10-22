import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isWarning?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isWarning, ...props }) => {
  const baseClasses = "w-full flex justify-center items-center text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const colorClasses = isWarning
    ? 'bg-amber-500 hover:bg-amber-600'
    : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]';

  return (
    <button
      className={`${baseClasses} ${colorClasses}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
