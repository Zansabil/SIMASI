import React from 'react';

/**
 * Komponen header halaman dashboard berisi judul besar dan subjudul.
 *
 * @param {object} props
 * @param {string} props.title    - Judul halaman (e.g. "Dashboard")
 * @param {string} props.subtitle - Subjudul / keterangan halaman
 */
export default function DashboardHeader({ title, subtitle }) {
  return (
    <section className="content-header">
      <h2 className="welcome-title">{title}</h2>
      {subtitle && <p className="welcome-subtitle">{subtitle}</p>}
    </section>
  );
}
