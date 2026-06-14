import React from 'react';
import './PageHeader.css';

export default function PageHeader({ title, children }) {
  return (
    <div className="page-header-row">
      <h2 className="welcome-title">{title}</h2>
      {children}
    </div>
  );
}
