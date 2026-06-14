import React, { useState, useEffect } from 'react';
import logoWide from '../../assets/logo-wide.png';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiShoppingCart, FiTool, FiBell, FiUser, FiPlus, FiTrash2, FiPrinter, FiEye, FiX, FiCheckCircle } from 'react-icons/fi';
import '../super-admin/PengadaanAset.css';
import NotificationBell from '../../components/layout/NotificationBell';

const defaultProcurements = [
  {
    id: 'proc-1',
    letter_number: '001/PENG-YAS/VI/2026',
    date: '10 Juni 2026',
    reporter_name: 'Ahmad Rizki',
    reporter_role: 'Petugas Perbaikan',
    items: [
      { name: 'Kipas Angin Dinding Maspion', location: 'Ruang Kelas 4A', qty: 2, price: 350000 },
      { name: 'Papan Tulis Whiteboard', location: 'Ruang Kelas 4B', qty: 1, price: 450000 }
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
      { name: 'Proyektor Epson EB-X400', location: 'Lab Komputer', qty: 1, price: 5800000 }
    ],
    total_cost: 5800000,
    status: 'approved',
    closing_text: 'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  }
];

export default function GuruPengadaanAset() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Guru');
  const [userRole, setUserRole] = useState('Guru');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedRole = localStorage.getItem('user_role');
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // State Management
  const [view, setView] = useState('list'); // 'list', 'create', 'preview'
  const [procurements, setProcurements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // for detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formLetterNumber, setFormLetterNumber] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formItems, setFormItems] = useState([{ name: '', location: '', qty: 1, price: 0 }]);
  const [formClosing, setFormClosing] = useState(
    'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  );

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('simas_procurements');
    if (stored) {
      setProcurements(JSON.parse(stored));
    } else {
      localStorage.setItem('simas_procurements', JSON.stringify(defaultProcurements));
      setProcurements(defaultProcurements);
    }
  }, []);

  // Helper date & roman month generators
  const getIndonesianDate = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const today = new Date();
    const date = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${date} ${month} ${year}`;
  };

  const getRomanMonth = () => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return roman[new Date().getMonth()];
  };

  const generateLetterNumber = (list) => {
    const count = list.length + 1;
    const numStr = String(count).padStart(3, '0');
    const romanMonth = getRomanMonth();
    const year = new Date().getFullYear();
    return `${numStr}/PENG-YAS/${romanMonth}/${year}`;
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Form handlers
  const handleOpenCreateForm = () => {
    const letterNo = generateLetterNumber(procurements);
    const dateStr = getIndonesianDate();
    setFormName(userName);
    setFormRole(userRole);
    setFormLetterNumber(letterNo);
    setFormDate(dateStr);
    setFormItems([{ name: '', location: '', qty: 1, price: 0 }]);
    setView('create');
  };

  const handleAddItemRow = () => {
    setFormItems([...formItems, { name: '', location: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (formItems.length === 1) return;
    const updated = formItems.filter((_, i) => i !== index);
    setFormItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = formItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'qty' || field === 'price' ? Number(value) : value
        };
      }
      return item;
    });
    setFormItems(updated);
  };

  const calculateGrandTotal = () => {
    return formItems.reduce((acc, curr) => acc + curr.qty * curr.price, 0);
  };

  // Submit / Preview helpers
  const [previewItem, setPreviewItem] = useState(null);
  const [backTo, setBackTo] = useState('list'); // 'list' or 'create'

  const handlePreviewForm = (e) => {
    e.preventDefault();
    const invalid = formItems.some(item => !item.name || !item.location || item.qty <= 0 || item.price < 0);
    if (invalid) {
      alert('Mohon lengkapi semua kolom barang dengan benar.');
      return;
    }
    const tempItem = {
      id: 'temp',
      letter_number: formLetterNumber,
      date: formDate,
      reporter_name: formName,
      reporter_role: formRole,
      items: formItems,
      total_cost: calculateGrandTotal(),
      status: 'pending',
      closing_text: formClosing
    };
    setPreviewItem(tempItem);
    setBackTo('create');
    setView('preview');
  };

  const handleSaveProcurement = () => {
    const newProc = {
      id: 'proc-' + Date.now(),
      letter_number: formLetterNumber,
      date: formDate,
      reporter_name: formName,
      reporter_role: formRole,
      items: formItems,
      total_cost: calculateGrandTotal(),
      status: 'pending',
      closing_text: formClosing
    };

    const updated = [newProc, ...procurements];
    localStorage.setItem('simas_procurements', JSON.stringify(updated));
    setProcurements(updated);
    setView('list');
    setIsSuccessOpen(true);
  };

  const handleOpenPreviewFromList = (item) => {
    setPreviewItem(item);
    setBackTo('list');
    setView('preview');
  };

  const handleOpenDetailModal = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );

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

  const filteredProcurements = procurements.filter(item => 
    item.letter_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reporter_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <div className="dashboard-layout">
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
            <a href="#dashboard" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/guru/dashboard'); setIsMobileMenuOpen(false); }}>
              <FiHome className="nav-icon" /> Dashboard
            </a>
            
            <a href="#assets" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/guru/daftar-aset'); setIsMobileMenuOpen(false); }}>
              <FiList className="nav-icon" /> Daftar Aset
            </a>
            
            <a href="#procurement" className="nav-link-item active" onClick={(e) => { e.preventDefault(); setView('list'); setIsMobileMenuOpen(false); }}>
              <FiShoppingCart className="nav-icon" /> Pengadaan Aset
            </a>
            
            <a href="#repair" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/guru/perbaikan'); setIsMobileMenuOpen(false); }}>
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

      <div className="main-wrapper">
        <header className="dashboard-navbar">
          <button className="hamburger-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
            <MenuIcon />
          </button>

          <div className="mobile-logo-header">
            <img src={logoWide} alt="SIMAS Logo" className="mobile-logo-img" />
          </div>

          <div className="nav-actions">
            <NotificationBell role="guru" />
            <div className="nav-profile-circle" title={userName} aria-label="Profil" style={{ cursor: 'pointer' }} onClick={() => navigate('/guru/profile')}>
              <FiUser size={22} />
            </div>
          </div>
        </header>

        <main className="dashboard-body">

          {view === 'list' && (
            <>
              <div className="procurement-header-row">
                <div>
                  <h2 className="procurement-page-title">Pengadaan Aset</h2>
                  <p className="procurement-page-subtitle">Ajukan dan kelola surat resmi pengadaan aset sekolah</p>
                </div>
                <button className="btn-create-procurement" onClick={handleOpenCreateForm}>
                  <FiPlus size={18} /> Buat Pengajuan Baru
                </button>
              </div>

              <div className="procurement-filter-row">
                <div className="procurement-search-container">
                  <span className="search-icon-wrapper"><SearchIcon /></span>
                  <input
                    type="text"
                    className="procurement-search-input"
                    placeholder="Cari berdasarkan nomor surat atau pengaju"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="procurement-table-wrapper">
                <table className="procurement-table-el">
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>No.</th>
                      <th>No. Surat</th>
                      <th>Tanggal</th>
                      <th>Nama Pengaju</th>
                      <th>Jabatan</th>
                      <th style={{ textAlign: 'center' }}>Jumlah Item</th>
                      <th style={{ textAlign: 'right' }}>Total Biaya</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProcurements.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                          Tidak ada data pengajuan pengadaan aset.
                        </td>
                      </tr>
                    ) : (
                      filteredProcurements.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}.</td>
                          <td className="font-semibold">{item.letter_number}</td>
                          <td>{item.date}</td>
                          <td>{item.reporter_name}</td>
                          <td>{item.reporter_role}</td>
                          <td style={{ textAlign: 'center' }}>
                            {item.items.reduce((acc, i) => acc + i.qty, 0)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>
                            {formatRupiah(item.total_cost)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-badge ${item.status}`}>
                              {getStatusText(item.status)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                className="action-icon-btn view-btn" 
                                title="Detail Pengajuan"
                                onClick={() => handleOpenDetailModal(item)}
                              >
                                <FiEye size={16} />
                              </button>
                              <button 
                                className="action-icon-btn edit-btn" 
                                title="Pratinjau / Cetak Surat"
                                onClick={() => handleOpenPreviewFromList(item)}
                              >
                                <FiPrinter size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === 'create' && (
            <div className="form-panel">
              <h3 className="form-panel-title">Buat Pengajuan Pengadaan Aset</h3>
              <p className="form-panel-subtitle">Silakan isi rincian barang/aset yang diajukan dalam tabel di bawah ini.</p>

              <form onSubmit={handlePreviewForm}>
                <div className="form-meta-grid">
                  <div className="form-field-group">
                    <label className="form-field-label">Nama Sekolah / Lembaga</label>
                    <input type="text" className="form-field-input" value="Yayasan Amir Ash-Shiddiiqi" readOnly />
                  </div>
                  <div className="form-field-group">
                    <label className="form-field-label">Nomor Surat (Otomatis)</label>
                    <input type="text" className="form-field-input" value={formLetterNumber} readOnly />
                  </div>
                  <div className="form-field-group">
                    <label className="form-field-label">Tanggal Pengajuan (Otomatis)</label>
                    <input type="text" className="form-field-input" value={formDate} readOnly />
                  </div>
                  <div className="form-field-group">
                    <label className="form-field-label">Alamat Sekolah</label>
                    <input type="text" className="form-field-input" value="Jalan Jambi – Muara Bulian KM 36, Kel. Jembatan Mas" readOnly />
                  </div>
                  <div className="form-field-group">
                    <label className="form-field-label">Nama Pengaju</label>
                    <input 
                      type="text" 
                      className="form-field-input" 
                      value={formName} 
                      onChange={(e) => setFormName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-field-label">Jabatan Pengaju</label>
                    <input 
                      type="text" 
                      className="form-field-input" 
                      value={formRole} 
                      onChange={(e) => setFormRole(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <h4 className="tindak-lanjut-section-title" style={{ marginTop: '32px', marginBottom: '16px' }}>Daftar Rincian Barang/Aset</h4>
                <div className="items-input-table-container">
                  <table className="items-input-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>No.</th>
                        <th>Nama Aset / Barang <span style={{ color: '#ef4444' }}>*</span></th>
                        <th>Lokasi Penempatan <span style={{ color: '#ef4444' }}>*</span></th>
                        <th style={{ width: '100px' }}>Jumlah <span style={{ color: '#ef4444' }}>*</span></th>
                        <th style={{ width: '180px' }}>Harga Satuan (Rp) <span style={{ color: '#ef4444' }}>*</span></th>
                        <th style={{ width: '180px' }}>Total Harga</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formItems.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}.</td>
                          <td>
                            <input
                              type="text"
                              className="form-field-input"
                              placeholder="Nama barang..."
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-field-input"
                              placeholder="Lokasi..."
                              value={item.location}
                              onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-field-input"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-field-input"
                              min="0"
                              placeholder="Rp..."
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              required
                            />
                          </td>
                          <td style={{ fontWeight: '600', color: '#1e293b', paddingLeft: '20px' }}>
                            {formatRupiah(item.qty * item.price)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-delete-row"
                              title="Hapus baris"
                              onClick={() => handleRemoveItemRow(index)}
                              disabled={formItems.length === 1}
                              style={{ opacity: formItems.length === 1 ? 0.4 : 1 }}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" className="btn-add-item-row" onClick={handleAddItemRow}>
                    <FiPlus size={16} /> Tambah Baris Aset
                  </button>
                </div>

                <div className="grand-total-row">
                  <span className="grand-total-label">Estimasi Grand Total:</span>
                  <span className="grand-total-val">{formatRupiah(calculateGrandTotal())}</span>
                </div>

                <div className="form-field-group" style={{ marginTop: '24px', textAlign: 'left' }}>
                  <label className="form-field-label">Kalimat Penutup Surat Pengajuan</label>
                  <textarea 
                    className="form-field-input" 
                    rows="4" 
                    value={formClosing}
                    onChange={(e) => setFormClosing(e.target.value)}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <div className="form-actions-row">
                  <button type="button" className="btn-cancel" onClick={() => setView('list')}>
                    Batal
                  </button>
                  <button type="submit" className="btn-preview">
                    <FiPrinter size={16} /> Pratinjau Surat
                  </button>
                </div>
              </form>
            </div>
          )}

          {view === 'preview' && previewItem && (
            <div className="letter-preview-screen">
              <div className="letter-actions-bar">
                <button className="btn-cancel" onClick={() => setView(backTo)}>Kembali</button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {backTo === 'create' && (
                    <button className="btn-submit-proc" onClick={handleSaveProcurement}>Kirim & Simpan Pengajuan</button>
                  )}
                  <button className="btn-preview" onClick={() => window.print()}>
                    <FiPrinter size={16} /> Cetak / Simpan PDF
                  </button>
                </div>
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

          {isDetailOpen && selectedItem && (
            <div className="modal-overlay-bg">
              <div className="detail-modal-container" style={{ maxWidth: '640px' }}>
                <button className="detail-modal-close-x" onClick={() => setIsDetailOpen(false)} aria-label="Tutup">
                  <FiX size={20} />
                </button>

                <h3 className="detail-modal-title">Detail Pengajuan Pengadaan</h3>
                <p className="detail-modal-subtitle">Informasi lengkap rincian barang yang telah diajukan.</p>

                <div className="detail-grid" style={{ marginBottom: '24px' }}>
                  <div>
                    <div className="detail-field-label">Nomor Surat</div>
                    <div className="detail-field-value">{selectedItem.letter_number}</div>
                  </div>
                  <div>
                    <div className="detail-field-label">Tanggal Pengajuan</div>
                    <div className="detail-field-value">{selectedItem.date}</div>
                  </div>
                  <div>
                    <div className="detail-field-label">Nama Pengaju</div>
                    <div className="detail-field-value">{selectedItem.reporter_name}</div>
                  </div>
                  <div>
                    <div className="detail-field-label">Jabatan Pengaju</div>
                    <div className="detail-field-value">{selectedItem.reporter_role}</div>
                  </div>
                  <div className="detail-full-width">
                    <div className="detail-field-label">Lembaga</div>
                    <div className="detail-field-value">Yayasan Amir Ash-Shiddiiqi</div>
                  </div>
                </div>

                <div className="detail-desc-header" style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                  Daftar Barang Yang Diajukan
                </div>
                
                <div style={{ overflowX: 'auto', marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px', width: '40px', textAlign: 'center' }}>No</th>
                        <th style={{ padding: '10px' }}>Nama Barang</th>
                        <th style={{ padding: '10px' }}>Lokasi</th>
                        <th style={{ padding: '10px', width: '70px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Harga</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.items.map((it, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
                          <td style={{ padding: '10px', fontWeight: '600' }}>{it.name}</td>
                          <td style={{ padding: '10px' }}>{it.location}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{it.qty}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{formatRupiah(it.price)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                            {formatRupiah(it.qty * it.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '600' }}>Status Approval:</span>
                  <span className={`status-badge ${selectedItem.status}`}>
                    {getStatusText(selectedItem.status)}
                  </span>
                </div>

                <div className="edit-modal-action-row">
                  <button className="edit-btn-save" onClick={() => setIsDetailOpen(false)}>
                    Tutup Detail
                  </button>
                </div>
              </div>
            </div>
          )}

          {isSuccessOpen && (
            <div className="modal-overlay-bg">
              <div className="modal-success-card">
                <div className="success-icon-wrapper">
                  <FiCheckCircle size={72} style={{ color: '#22c55e' }} />
                </div>
                <h3 className="success-modal-title">Pengajuan Terkirim</h3>
                <p className="success-modal-subtitle">Surat pengajuan pengadaan aset berhasil dibuat dan disimpan.</p>
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
