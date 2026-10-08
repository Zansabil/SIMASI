import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './FilterSelect.css';

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
        <FiChevronDown size={16} strokeWidth={2.5} />
      </span>
    </div>
  );
}
