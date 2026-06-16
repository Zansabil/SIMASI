import React from 'react';
import './PageHeader.css';

export default function PageHeader({ 
  title, 
  subtitle, 
  actionLabel, 
  onActionClick, 
  actionIcon: ActionIcon, 
  actionClassName = 'page-header-action-btn',
  children 
}) {
  return (
    <div className="page-header-container">
      {/* Upper Row: Title & Subtitle vs Action Button */}
      <div className="page-header-row">
        <div className="page-header-title-area">
          <h2 className="page-header-title">{title}</h2>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actionLabel && (
          <button className={actionClassName} onClick={onActionClick}>
            {ActionIcon && <ActionIcon size={18} style={{ marginRight: '6px' }} />}
            {actionLabel}
          </button>
        )}
      </div>

      {/* Lower Row: Search/Filters Slot */}
      {children && (
        <div className="page-header-filter-row">
          {children}
        </div>
      )}
    </div>
  );
}

