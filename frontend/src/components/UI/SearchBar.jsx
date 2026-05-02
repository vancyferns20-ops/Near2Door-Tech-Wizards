import React from 'react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  onSubmit,
  submitLabel = 'Search',
}) => {
  const input = (
    <div className="relative">
      <input
        id="search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white placeholder:text-slate-400 shadow-[0_12px_30px_rgba(15,23,42,0.2)] focus:outline-none focus:ring-2 focus:ring-lime-400"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          aria-label="Clear search"
        >
          ×
        </button>
      ) : null}
    </div>
  );

  if (!onSubmit) {
    return <div className="w-full">{input}</div>;
  }

  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">{input}</div>
        <button
          type="submit"
          className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#a3e635)] px-5 py-3 font-bold text-white shadow-[0_18px_34px_rgba(59,130,246,0.22),0_6px_18px_rgba(163,230,53,0.16)] transition hover:-translate-y-0.5"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;