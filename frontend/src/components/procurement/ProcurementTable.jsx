import React, { useState } from 'react';
import { FiChevronDown, FiEye, FiCheck, FiX, FiEdit2 } from 'react-icons/fi';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export default function ProcurementTable({ 
  procurements, 
  onViewDetail, 
  onPreviewLetter, 
  statusFilter = 'all',
  showActions = false,
  showUnit = true,
  onApproveItem,
  onRejectItem,
  onUpdateRejectNotes
}) {
  const [expandedCards, setExpandedCards] = useState({});
  const [revisingItems, setRevisingItems] = useState({});
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [editingNotesText, setEditingNotesText] = useState('');

  const toggleCardExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCounters = (items) => {
    let waiting = 0;
    let approved = 0;
    let rejected = 0;

    items.forEach(item => {
      const itemStatus = item.status || 'pending';
      if (itemStatus === 'pending') waiting++;
      else if (itemStatus === 'approved') approved++;
      else if (itemStatus === 'rejected') rejected++;
    });

    return { waiting, approved, rejected };
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  // If statusFilter is not 'all', render the flat table directly
  if (statusFilter !== 'all') {
    const allFilteredItems = [];
    procurements.forEach(proc => {
      (proc.items || []).forEach(item => {
        const itemStatus = item.status || 'pending';
        if (itemStatus === statusFilter) {
          allFilteredItems.push({
            ...item,
            parent: proc
          });
        }
      });
    });

    return (
      <div className="approval-table-wrapper">
        <table className="approval-table-el">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>No</th>
              <th>Nama Aset</th>
              {showUnit && <th>Unit</th>}
              <th>Spesifikasi / Lokasi</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Jumlah</th>
              <th style={{ width: '160px', textAlign: 'right' }}>Estimasi Harga</th>
              <th style={{ width: '160px', textAlign: 'right' }}>Total</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
              {showActions && <th style={{ width: '220px', textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {allFilteredItems.length === 0 ? (
              <tr>
                <td colSpan={showActions ? (showUnit ? 9 : 8) : (showUnit ? 8 : 7)} style={{ textAlign: 'center', padding: '32px' }}>
                  Tidak ada data aset dengan status ini.
                </td>
              </tr>
            ) : (
              allFilteredItems.map((subItem, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{index + 1}.</td>
                  <td className="font-semibold">{subItem.name}</td>
                  {showUnit && <td>{subItem.unit || '-'}</td>}
                  <td>{subItem.location}</td>
                  <td style={{ textAlign: 'center' }}>{subItem.qty} unit</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(subItem.price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>
                    {formatRupiah(subItem.qty * subItem.price)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-badge ${(subItem.status || 'pending').toLowerCase()}`}>
                      {getStatusText(subItem.status || 'pending')}
                    </span>
                    {subItem.notes && (
                      <div className="item-notes-text" style={{ marginTop: '4px' }}>
                        {editingNotesId === `${subItem.parent.id}-${subItem.parent.items.indexOf(subItem)}` ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            <textarea 
                              className="decision-textarea" 
                              style={{ minHeight: '60px', marginBottom: 0, padding: '6px 8px', fontSize: '12px' }}
                              value={editingNotesText}
                              onChange={(e) => setEditingNotesText(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button 
                                className="edit-btn-cancel" 
                                style={{ padding: '4px 8px', fontSize: '11px', background: '#e2e8f0' }}
                                onClick={() => setEditingNotesId(null)}
                              >
                                Batal
                              </button>
                              <button 
                                className="decision-btn-submit approve" 
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => {
                                  onUpdateRejectNotes(subItem.parent.id, subItem.parent.items.indexOf(subItem), editingNotesText);
                                  setEditingNotesId(null);
                                }}
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            Catatan: "{subItem.notes}"
                            {subItem.status === 'rejected' && showActions && (
                              <button 
                                onClick={() => {
                                  setEditingNotesId(`${subItem.parent.id}-${subItem.parent.items.indexOf(subItem)}`);
                                  setEditingNotesText(subItem.notes);
                                }}
                                style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0 4px', marginLeft: '4px' }}
                                title="Edit catatan penolakan"
                              >
                                <FiEdit2 size={12} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  {showActions && (
                    <td style={{ textAlign: 'center' }}>
                      {subItem.status === 'pending' || revisingItems[`${subItem.parent.id}-${subItem.parent.items.indexOf(subItem)}`] ? (
                        <div className="action-decision-cell">
                          <button
                            type="button"
                            className="btn-approve-item"
                            onClick={() => onApproveItem(subItem.parent.id, subItem.parent.items.indexOf(subItem))}
                          >
                            <FiCheck size={14} /> Setuju
                          </button>
                          <button
                            type="button"
                            className="btn-reject-item"
                            onClick={() => onRejectItem(subItem.parent.id, subItem.parent.items.indexOf(subItem))}
                          >
                            <FiX size={14} /> Tolak
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-revise-item"
                          onClick={() => setRevisingItems(prev => ({...prev, [`${subItem.parent.id}-${subItem.parent.items.indexOf(subItem)}`]: true}))}
                        >
                          <FiEdit2 size={14} /> Revisi
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Otherwise render the Collapsible Cards layout (for 'all' filter)
  return (
    <div className="procurement-cards-container">
      {procurements.length === 0 ? (
        <div className="stat-card" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>Tidak Ada Pengajuan</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>Belum ada berkas pengajuan pengadaan aset yang masuk.</p>
        </div>
      ) : (
        procurements.map((item) => {
          const { waiting, approved, rejected } = getCounters(item.items || []);
          const isExpanded = !!expandedCards[item.id];

          return (
            <div className="procurement-approval-card" key={item.id}>
              {/* Card Header (Clickable) */}
              <div className="card-header-clickable" onClick={() => toggleCardExpand(item.id)}>
                <div className="card-meta-left">
                  <span className="card-date-badge">{item.date}</span>
                  <h4 className="card-letter-number">{item.letter_number}</h4>
                  <p className="card-submitter-info">
                    Diajukan oleh: <span className="font-semibold">{item.reporter_name}</span> ({item.reporter_role})
                  </p>
                </div>

                <div className="card-meta-right">
                  {/* Counters Block matching Image 1 */}
                  <div className="card-counters-group">
                    <div className="card-counters-wrapper">
                      <div className="counter-item">
                        <span className="counter-number waiting">{waiting}</span>
                        <span className="counter-label">Menunggu</span>
                      </div>
                      <div className="counter-item">
                        <span className="counter-number approved">{approved}</span>
                        <span className="counter-label">Disetujui</span>
                      </div>
                      <div className="counter-item">
                        <span className="counter-number rejected">{rejected}</span>
                        <span className="counter-label">Ditolak</span>
                      </div>
                    </div>
                  </div>

                  {/* Chevron Icon toggler */}
                  <div className={`chevron-icon-wrapper ${isExpanded ? 'expanded' : ''}`}>
                    <FiChevronDown size={22} />
                  </div>
                </div>
              </div>

              {/* Expandable Details Area (Visible when isExpanded is true) */}
              {isExpanded && (
                <div className="card-details-expandable">
                  <div className="expandable-inner-padding">
                    <div className="approval-table-wrapper">
                      <table className="approval-table-el">
                        <thead>
                          <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                            <th>Nama Aset</th>
                            {showUnit && <th>Unit</th>}
                            <th>Spesifikasi / Lokasi</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Jumlah</th>
                            <th style={{ width: '160px', textAlign: 'right' }}>Estimasi Harga</th>
                            <th style={{ width: '160px', textAlign: 'right' }}>Total</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                            {showActions && <th style={{ width: '220px', textAlign: 'center' }}>Aksi</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {(item.items || []).map((subItem, index) => (
                            <tr key={index}>
                              <td style={{ textAlign: 'center' }}>{index + 1}.</td>
                              <td className="font-semibold">{subItem.name}</td>
                              {showUnit && <td>{subItem.unit || '-'}</td>}
                              <td>{subItem.location}</td>
                              <td style={{ textAlign: 'center' }}>{subItem.qty} unit</td>
                              <td style={{ textAlign: 'right' }}>{formatRupiah(subItem.price)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>
                                {formatRupiah(subItem.qty * subItem.price)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`status-badge ${(subItem.status || 'pending').toLowerCase()}`}>
                                  {getStatusText(subItem.status || 'pending')}
                                </span>
                                {subItem.notes && (
                                  <div className="item-notes-text" style={{ marginTop: '4px' }}>
                                    {editingNotesId === `${item.id}-${index}` ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                                        <textarea 
                                          className="decision-textarea" 
                                          style={{ minHeight: '60px', marginBottom: 0, padding: '6px 8px', fontSize: '12px' }}
                                          value={editingNotesText}
                                          onChange={(e) => setEditingNotesText(e.target.value)}
                                        />
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                          <button 
                                            className="edit-btn-cancel" 
                                            style={{ padding: '4px 8px', fontSize: '11px', background: '#e2e8f0' }}
                                            onClick={() => setEditingNotesId(null)}
                                          >
                                            Batal
                                          </button>
                                          <button 
                                            className="decision-btn-submit approve" 
                                            style={{ padding: '4px 8px', fontSize: '11px' }}
                                            onClick={() => {
                                              onUpdateRejectNotes(item.id, index, editingNotesText);
                                              setEditingNotesId(null);
                                            }}
                                          >
                                            Simpan
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        Catatan: "{subItem.notes}"
                                        {subItem.status === 'rejected' && showActions && (
                                          <button 
                                            onClick={() => {
                                              setEditingNotesId(`${item.id}-${index}`);
                                              setEditingNotesText(subItem.notes);
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0 4px', marginLeft: '4px' }}
                                            title="Edit catatan penolakan"
                                          >
                                            <FiEdit2 size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </td>
                              {showActions && (
                                <td style={{ textAlign: 'center' }}>
                                  {subItem.status === 'pending' || revisingItems[`${item.id}-${index}`] ? (
                                    <div className="action-decision-cell">
                                      <button
                                        type="button"
                                        className="btn-approve-item"
                                        onClick={() => onApproveItem(item.id, index)}
                                      >
                                        <FiCheck size={14} /> Setuju
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-reject-item"
                                        onClick={() => onRejectItem(item.id, index)}
                                      >
                                        <FiX size={14} /> Tolak
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn-revise-item"
                                      onClick={() => setRevisingItems(prev => ({...prev, [`${item.id}-${index}`]: true}))}
                                    >
                                      <FiEdit2 size={14} /> Revisi
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Action area: button only, aligned to bottom right */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button 
                        type="button"
                        className="btn-view-full-letter"
                        onClick={() => onPreviewLetter(item)}
                      >
                        <FiEye size={16} /> Lihat Surat Lengkap
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

