import React from 'react';

export default function PriorityBadge({ priority }) {
  switch (priority) {
    case 'high':
      return <span className="repair-priority-badge priority-high">Mendesak</span>;
    case 'medium':
      return <span className="repair-priority-badge priority-medium">Sedang</span>;
    case 'low':
      return <span className="repair-priority-badge priority-low">Tidak Mendesak</span>;
    default:
      return <span className="repair-priority-badge">{priority || 'Sedang'}</span>;
  }
}
