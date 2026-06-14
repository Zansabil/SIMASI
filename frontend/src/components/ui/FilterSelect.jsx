import React from 'react';
import './FilterSelect.css';

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function FilterSelect({ value, onChange, options = [] }) {
  return (
    <div className="dropdown-container">
      <select
        className="category-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="dropdown-arrow-wrapper">
        <ChevronDownIcon />
      </span>
    </div>
  );
}
