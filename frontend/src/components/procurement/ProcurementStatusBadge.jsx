import React from 'react';

const STATUS_MAP = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export default function ProcurementStatusBadge({ status }) {
  const displayStatus = STATUS_MAP[status] || status;
  return (
    <span className={`status-badge ${status}`}>
      {displayStatus}
    </span>
  );
}
