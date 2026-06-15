import React from 'react';
import './StatusFilter.css';

export default function StatusFilter({ value, onChange, options = [] }) {
  return (
    <div className="status-filter-group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`status-filter-btn ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
