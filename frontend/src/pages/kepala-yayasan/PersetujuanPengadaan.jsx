import React, { useState, useEffect } from 'react';
import logoWide from '../../assets/logo-wide.png';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiShoppingCart, FiTool, FiBell, FiUser, FiChevronDown, FiX, FiCheck, FiCheckCircle, FiEye, FiPrinter } from 'react-icons/fi';
import './PersetujuanPengadaan.css';
import '../super-admin/PengadaanAset.css';
import NotificationBell from '../../components/layout/NotificationBell';
import PageHeader from '../../components/ui/PageHeader';

const defaultProcurements = [
  {
    id: 'proc-1',
    letter_number: '001/PENG-YAS/VI/2026',
    date: '10 Juni 2026',
    reporter_name: 'Ahmad Rizki',
    reporter_role: 'Petugas Perbaikan',
    items: [
      { name: 'Kipas Angin Dinding Maspion', location: 'Ruang Kelas 4A', qty: 2, price: 350000, status: 'pending', notes: '' },
      { name: 'Papan Tulis Whiteboard', location: 'Ruang Kelas 4B', qty: 1, price: 450000, status: 'pending', notes: '' }
    ],
    total_cost: 1150000,
    status: 'pending',
    closing_text: 'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  },
  {
    id: 'proc-2',
    letter_number: '002/PENG-YAS/VI/2026',
    date: '05 Juni 2026',
    reporter_name: 'Siti Maesaroh',
    reporter_role: 'Guru',
    items: [
      { name: 'Proyektor Epson EB-X400', location: 'Lab Komputer', qty: 1, price: 5800000, status: 'approved', notes: 'Sangat dibutuhkan untuk kegiatan lab' }
    ],
    total_cost: 5800000,
    status: 'approved',
    closing_text: 'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  }
];

export default function PersetujuanPengadaan() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Kepala Yayasan');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // State Management
  const [procurements, setProcurements] = useState([]);
  const [expandedCards, setExpandedCards] = useState({}); // Stores expanded state { id: true/false }
  const [view, setView] = useState('list'); // 'list', 'preview'
  const [previewItem, setPreviewItem] = useState(null);
  
  // Decision Modal States
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('approve'); // 'approve' or 'reject'
  const [decisionNotes, setDecisionNotes] = useState('');
  const [activeItemInfo, setActiveItemInfo] = useState(null); // { procurementId, itemIndex }
  
  // Success state
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load from localStorage or seed defaults
  useEffect(() => {
    const stored = localStorage.getItem('simas_procurements');
    if (stored) {
      // Map existing localStorage items to ensure item-level status exists
      const parsed = JSON.parse(stored).map(proc => ({
        ...proc,
        items: proc.items.map(item => ({
          ...item,
          status: item.status || 'pending',
          notes: item.notes || ''
        }))
      }));
      setProcurements(parsed);
    } else {
      localStorage.setItem('simas_procurements', JSON.stringify(defaultProcurements));
      setProcurements(defaultProcurements);
    }
  }, []);

  const toggleCardExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenDecision = (procurementId, itemIndex, type) => {
    setActiveItemInfo({ procurementId, itemIndex });
    setDecisionType(type);
    setDecisionNotes('');
    setIsDecisionOpen(true);
  };

  const handleConfirmDecision = (e) => {
    e.preventDefault();
    if (!activeItemInfo) return;

    const { procurementId, itemIndex } = activeItemInfo;

    const updatedProcurements = procurements.map(proc => {
      if (proc.id === procurementId) {
        // Update item status and notes
        const updatedItems = proc.items.map((item, idx) => {
          if (idx === itemIndex) {
            return {
              ...item,
              status: decisionType === 'approve' ? 'approved' : 'rejected',
              notes: decisionNotes
            };
          }
          return item;
        });

        // Determine parent status:
        // - if all items are approved: parent status = approved
        // - if all items are rejected: parent status = rejected
        // - else: parent status = pending
        const allApproved = updatedItems.every(i => i.status === 'approved');
        const allRejected = updatedItems.every(i => i.status === 'rejected');
        let newStatus = 'pending';
        if (allApproved) newStatus = 'approved';
        else if (allRejected) newStatus = 'rejected';

        return {
          ...proc,
          items: updatedItems,
          status: newStatus
        };
      }
      return proc;
    });

    localStorage.setItem('simas_procurements', JSON.stringify(updatedProcurements));
    setProcurements(updatedProcurements);
    setIsDecisionOpen(false);

    setSuccessMessage(
      decisionType === 'approve' 
        ? 'Aset berhasil disetujui untuk pengadaan.' 
        : 'Pengadaan aset berhasil ditolak.'
    );
    setIsSuccessOpen(true);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Counters helper for a specific procurement card
  const getCounters = (items) => {
    let waiting = 0;
    let approved = 0;
    let rejected = 0;

    items.forEach(item => {
      if (item.status === 'pending') waiting++;
      else if (item.status === 'approved') approved++;
      else if (item.status === 'rejected') rejected++;
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

  const LogoutIcon = (props) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={props.className}>
      <path d="M10 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-9" />
      <polyline points="8 17 3 12 8 7" />
      <line x1="16" y1="12" x2="3" y2="12" />
    </svg>
  );

  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );

  return (
    <div className="dashboard-layout">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo-container">
            <img src={logoWide} alt="SIMAS Logo" className="sidebar-logo" />
          </div>

          <nav className="sidebar-menu">
            <a href="#dashboard" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/kepala-yayasan/dashboard'); setIsMobileMenuOpen(false); }}>
              <FiHome className="nav-icon" /> Dashboard
            </a>
            
            <a href="#assets" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/kepala-yayasan/daftar-aset'); setIsMobileMenuOpen(false); }}>
              <FiList className="nav-icon" /> Daftar Aset
            </a>
            
            <a href="#procurement" className="nav-link-item active" onClick={(e) => { e.preventDefault(); navigate('/kepala-yayasan/persetujuan'); setIsMobileMenuOpen(false); }}>
              <FiShoppingCart className="nav-icon" /> Persetujuan Pengadaan
            </a>
            
            <a href="#repair" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/kepala-yayasan/perbaikan'); setIsMobileMenuOpen(false); }}>
              <FiTool className="nav-icon" /> Perbaikan Aset
            </a>
          </nav>
        </div>

        <div className="logout-container">
          <button className="logout-link" onClick={handleLogout}>
            <LogoutIcon className="nav-icon" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        {/* Sticky Top Navbar */}
        <header className="dashboard-navbar">
          <button className="hamburger-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
            <MenuIcon />
          </button>

          <div className="mobile-logo-header">
            <img src={logoWide} alt="SIMAS Logo" className="mobile-logo-img" />
          </div>

          <div className="nav-actions">
            <NotificationBell role="kepala-yayasan" />
            <div className="nav-profile-circle" title={userName} aria-label="Profil" style={{ cursor: 'pointer' }} onClick={() => navigate('/kepala-yayasan/profile')}>
              <FiUser size={22} />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dashboard-body">
          {view === 'list' ? (
            <>
              <PageHeader
                title="Persetujuan Pengadaan Aset"
                subtitle="Tinjau, setujui, atau tolak berkas usulan pengadaan barang dari unit kerja"
              />

              {/* List of Collapsible Cards */}
              <div style={{ marginTop: '24px' }}>
                {procurements.length === 0 ? (
                  <div className="stat-card" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <FiShoppingCart size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>Tidak Ada Pengajuan</h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>Belum ada berkas pengajuan pengadaan aset yang masuk.</p>
                  </div>
                ) : (
                  procurements.map(proc => {
                    const { waiting, approved, rejected } = getCounters(proc.items);
                    const isExpanded = !!expandedCards[proc.id];

                    return (
                      <div className="procurement-approval-card" key={proc.id}>
                        {/* Card Header (Clickable) */}
                        <div className="card-header-clickable" onClick={() => toggleCardExpand(proc.id)}>
                          <div className="card-meta-left">
                            <span className="card-date-badge">{proc.date}</span>
                            <h4 className="card-letter-number">{proc.letter_number}</h4>
                            <p className="card-submitter-info">
                              Diajukan oleh: <span className="font-semibold">{proc.reporter_name}</span> ({proc.reporter_role})
                            </p>
                          </div>

                          <div className="card-meta-right">
                            {/* Counters Block matching Image 2 */}
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
                                  <th>Spesifikasi / Lokasi</th>
                                  <th style={{ width: '100px', textAlign: 'center' }}>Jumlah</th>
                                  <th style={{ width: '160px', textAlign: 'right' }}>Estimasi Harga</th>
                                  <th style={{ width: '160px', textAlign: 'right' }}>Total</th>
                                  <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                                  <th style={{ width: '220px', textAlign: 'center' }}>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {proc.items.map((item, index) => (
                                  <tr key={index}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}.</td>
                                    <td className="font-semibold">{item.name}</td>
                                    <td>{item.location}</td>
                                    <td style={{ textAlign: 'center' }}>{item.qty} unit</td>
                                    <td style={{ textAlign: 'right' }}>{formatRupiah(item.price)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>
                                      {formatRupiah(item.qty * item.price)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      {/* Match Image 1 status colors */}
                                      <span className={`status-badge ${item.status}`}>
                                        {getStatusText(item.status)}
                                      </span>
                                      {item.notes && (
                                        <div className="item-notes-text">
                                          Catatan: "{item.notes}"
                                        </div>
                                      )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      {item.status === 'pending' ? (
                                        <div className="action-decision-cell">
                                          <button
                                            className="btn-approve-item"
                                            onClick={() => handleOpenDecision(proc.id, index, 'approve')}
                                          >
                                            <FiCheck size={14} /> Setuju
                                          </button>
                                          <button
                                            className="btn-reject-item"
                                            onClick={() => handleOpenDecision(proc.id, index, 'reject')}
                                          >
                                            <FiX size={14} /> Tolak
                                          </button>
                                        </div>
                                      ) : (
                                        <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                          Keputusan Selesai
                                        </span>
                                      )}
                                    </td>
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
                              onClick={() => {
                                setPreviewItem(proc);
                                setView('preview');
                              }}
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
          </>
          ) : (
            <div className="letter-preview-screen">
              <div className="letter-actions-bar">
                <button className="btn-cancel" onClick={() => setView('list')}>Kembali</button>
                <button className="btn-preview" onClick={() => window.print()}>
                  <FiPrinter size={16} /> Cetak / Simpan PDF
                </button>
              </div>

              <div className="official-letter-paper">
                <div className="letterhead-container">
                  <div className="letterhead-text">
                    <h1 className="letterhead-title">Yayasan Amir Ash-Shiddiiqi</h1>
                    <h2 className="letterhead-school">Pesantren Modern Amir Ash-Shiddiiqi</h2>
                    <p className="letterhead-address">
                      Jalan Jambi – Muara Bulian KM 36, Kelurahan Jembatan Mas, Kecamatan Pemayung,<br />
                      Kabupaten Batanghari, Jambi. Telp: (0743) 123456 | Kode Pos: 36657
                    </p>
                  </div>
                </div>

                <div className="letter-meta-row">
                  <div className="letter-meta-left">
                    <span>Nomor : {previewItem.letter_number}</span>
                    <span>Lamp. : -</span>
                    <span>Hal &nbsp; &nbsp;: Pengajuan Pengadaan Aset</span>
                  </div>
                  <div className="letter-meta-right">
                    <span>Batanghari, {previewItem.date}</span>
                  </div>
                </div>

                <div className="letter-recipient-block">
                  <span>Kepada Yth.</span>
                  <div className="recipient-title">Ketua Yayasan Amir Ash-Shiddiiqi</div>
                  <span>di Tempat</span>
                </div>

                <p className="letter-body-paragraph">
                  Dengan hormat, sehubungan dengan adanya kebutuhan sarana dan prasarana untuk menunjang kegiatan operasional pembelajaran di lingkungan Yayasan Amir Ash-Shiddiiqi, bersama surat ini kami mengajukan permohonan pengadaan barang/aset sebagai berikut:
                </p>

                <table className="letter-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>No.</th>
                      <th>Nama Aset / Barang</th>
                      <th>Lokasi Penempatan</th>
                      <th style={{ width: '80px' }}>Jumlah</th>
                      <th style={{ width: '140px' }}>Harga Satuan</th>
                      <th style={{ width: '150px' }}>Total Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewItem.items.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}.</td>
                        <td>{item.name}</td>
                        <td>{item.location}</td>
                        <td className="text-center">{item.qty} Unit</td>
                        <td className="text-right">{formatRupiah(item.price)}</td>
                        <td className="text-right" style={{ fontWeight: 'bold' }}>{formatRupiah(item.qty * item.price)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', padding: '8px' }}>Grand Total Biaya:</td>
                      <td className="text-right" style={{ fontWeight: 'bold', fontSize: '14px', borderTop: '2px double #000' }}>
                        {formatRupiah(previewItem.total_cost)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="letter-body-paragraph">
                  {previewItem.closing_text}
                </p>

                <div className="letter-signatures-block">
                  <div className="sig-col">
                    <span>Mengetahui,</span>
                    <span>Kepala Unit Kerja</span>
                    <div className="sig-spacer"></div>
                    <span className="sig-name">...................................................</span>
                    <span>NIP. ..........................................</span>
                  </div>
                  <div className="sig-col">
                    <span>Hormat Kami,</span>
                    <span>Pengaju</span>
                    <div className="sig-spacer"></div>
                    <span className="sig-name">{previewItem.reporter_name}</span>
                    <span className="sig-role">{previewItem.reporter_role}</span>
                  </div>
                </div>

                <div className="letter-approval-row">
                  <div className="sig-col" style={{ width: '250px' }}>
                    <span>Menyetujui,</span>
                    <span>Ketua Yayasan Amir Ash-Shiddiiqi</span>
                    <div className="sig-spacer" style={{ height: '70px' }}></div>
                    <span className="sig-name">H. Amir Ash-Shiddiiqi, M.Pd.</span>
                    <span>Ketua Yayasan</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DECISION MODAL WITH NOTES INPUT */}
          {isDecisionOpen && (
            <div className="modal-overlay-bg">
              <div className="decision-modal-container">
                <button
                  className="detail-modal-close-x"
                  onClick={() => setIsDecisionOpen(false)}
                  aria-label="Tutup"
                >
                  <FiX size={20} />
                </button>

                <h3 className="decision-modal-title">
                  {decisionType === 'approve' ? 'Setujui Pengadaan Aset' : 'Tolak Pengadaan Aset'}
                </h3>
                <p className="decision-modal-subtitle">
                  {decisionType === 'approve' 
                    ? 'Berikan catatan persetujuan Anda mengenai barang yang diajukan di bawah ini.'
                    : 'Berikan alasan/catatan penolakan mengenai pengadaan barang ini.'}
                </p>

                <form onSubmit={handleConfirmDecision}>
                  <textarea
                    className="decision-textarea"
                    placeholder={
                      decisionType === 'approve' 
                        ? 'Tuliskan catatan persetujuan (opsional)...' 
                        : 'Tuliskan alasan penolakan (wajib)...'
                    }
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    required={decisionType === 'reject'}
                  />

                  <div className="edit-modal-action-row">
                    <button
                      type="button"
                      className="edit-btn-cancel"
                      onClick={() => setIsDecisionOpen(false)}
                      style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`decision-btn-submit ${decisionType}`}
                    >
                      {decisionType === 'approve' ? 'Setujui Pengadaan' : 'Tolak Pengadaan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SUCCESS MODAL */}
          {isSuccessOpen && (
            <div className="modal-overlay-bg">
              <div className="modal-success-card">
                <div className="success-icon-wrapper">
                  <FiCheckCircle size={72} style={{ color: '#22c55e' }} />
                </div>
                <h3 className="success-modal-title">Keputusan Disimpan</h3>
                <p className="success-modal-subtitle">{successMessage}</p>
                <button className="success-modal-ok-btn" onClick={() => setIsSuccessOpen(false)}>
                  OK
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
