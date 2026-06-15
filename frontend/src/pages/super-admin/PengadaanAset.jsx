import React, { useState, useEffect } from 'react';
import logoWide from '../../assets/logo-wide.png';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiShoppingCart, FiTool, FiUser, FiUsers, FiPlus, FiCheckCircle } from 'react-icons/fi';
import NotificationBell from '../../components/layout/NotificationBell';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import ProcurementStatusBadge from '../../components/procurement/ProcurementStatusBadge';
import ProcurementTable from '../../components/procurement/ProcurementTable';
import ProcurementForm from '../../components/procurement/ProcurementForm';
import ProcurementLetterPreview from '../../components/procurement/ProcurementLetterPreview';
import ProcurementDetailModal from '../../components/procurement/ProcurementDetailModal';
import '../../components/procurement/Procurement.css';

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

export default function SuperPengadaanAset() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Super Admin');
  const [userRole, setUserRole] = useState('Super Admin');

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
    // Validate that form items are filled
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
            <a href="#dashboard" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/super-admin/dashboard'); setIsMobileMenuOpen(false); }}>
              <FiHome className="nav-icon" /> Dashboard
            </a>
            
            <a href="#assets" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/super-admin/daftar-aset'); setIsMobileMenuOpen(false); }}>
              <FiList className="nav-icon" /> Daftar Aset
            </a>
            
            <a href="#procurement" className="nav-link-item active" onClick={(e) => { e.preventDefault(); setView('list'); setIsMobileMenuOpen(false); }}>
              <FiShoppingCart className="nav-icon" /> Pengadaan Aset
            </a>
            
            <a href="#repair" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/super-admin/perbaikan'); setIsMobileMenuOpen(false); }}>
              <FiTool className="nav-icon" /> Perbaikan Aset
            </a>

            <a href="#users" className="nav-link-item" onClick={(e) => { e.preventDefault(); navigate('/super-admin/manajemen-pengguna'); setIsMobileMenuOpen(false); }}>
              <FiUsers className="nav-icon" /> Manajemen Pengguna
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
            <NotificationBell role="super-admin" />
            <div className="nav-profile-circle" title={userName} aria-label="Profil" style={{ cursor: 'pointer' }} onClick={() => navigate('/super-admin/profile')}>
              <FiUser size={22} />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dashboard-body">

          {/* 1. LIST VIEW */}
          {view === 'list' && (
            <>
              <PageHeader
                title="Pengadaan Aset"
                subtitle="Ajukan dan kelola surat resmi pengadaan aset sekolah"
                actionLabel="Buat Pengajuan Baru"
                onActionClick={handleOpenCreateForm}
                actionIcon={FiPlus}
              >
                <div style={{ width: '320px' }}>
                  <SearchBar
                    placeholder="Cari berdasarkan nomor surat atau pengaju"
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
              </PageHeader>

              <ProcurementTable
                procurements={filteredProcurements}
                onViewDetail={handleOpenDetailModal}
                onPreviewLetter={handleOpenPreviewFromList}
              />
            </>
          )}

          {view === 'create' && (
            <ProcurementForm
              formLetterNumber={formLetterNumber}
              formDate={formDate}
              formName={formName}
              setFormName={setFormName}
              formRole={formRole}
              setFormRole={setFormRole}
              formItems={formItems}
              onItemChange={handleItemChange}
              onAddItemRow={handleAddItemRow}
              onRemoveItemRow={handleRemoveItemRow}
              formClosing={formClosing}
              setFormClosing={setFormClosing}
              onSubmit={handlePreviewForm}
              onCancel={() => setView('list')}
              grandTotal={calculateGrandTotal()}
            />
          )}

          {view === 'preview' && previewItem && (
            <ProcurementLetterPreview
              previewItem={previewItem}
              onBack={() => setView(backTo)}
              onSave={handleSaveProcurement}
              showConfirm={backTo === 'create'}
            />
          )}

          <ProcurementDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            selectedItem={selectedItem}
          />

          {/* SUCCESS DIALOG */}
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
