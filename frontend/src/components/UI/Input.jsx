import React from 'react';

const Input = ({ label, name, type = 'text', value, onChange, error }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-gray-200 text-sm font-bold mb-2">{label}</label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className={`shadow appearance-none rounded-xl w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all duration-300 bg-slate-700 text-white placeholder-gray-400 border-2 ${error ? 'border-red-500' : 'border-slate-600'}`}
    />
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
  </div>
);

export default Input;