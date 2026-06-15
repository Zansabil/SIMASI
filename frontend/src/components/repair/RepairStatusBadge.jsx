import React from 'react';

export default function RepairStatusBadge({ status }) {
  switch (status) {
    case 'pending':
    case 'approved':
      return <span className="repair-status-badge status-waiting">Menunggu</span>;
    case 'in_progress':
      return <span className="repair-status-badge status-process">Sedang di Kerjakan</span>;
    case 'completed':
      return <span className="repair-status-badge status-done">Selesai</span>;
    case 'rejected':
      return <span className="repair-status-badge status-rejected">Ditolak</span>;
    default:
      return <span className="repair-status-badge">{status}</span>;
  }
}
