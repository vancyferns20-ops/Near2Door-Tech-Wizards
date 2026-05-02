import React from 'react';

const Button = ({ children, type = 'button', onClick, disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#a3e635)] px-4 py-3 font-bold text-white shadow-[0_18px_34px_rgba(59,130,246,0.22),0_6px_18px_rgba(163,230,53,0.16)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(59,130,246,0.24),0_8px_22px_rgba(163,230,53,0.18)] focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
  >
    {children}
  </button>
);

export default Button;