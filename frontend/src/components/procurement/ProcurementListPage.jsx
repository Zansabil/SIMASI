import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FiPlus, FiX, FiPrinter, FiLoader } from 'react-icons/fi';
import DashboardLayout from '../layout/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import StatusFilter from '../ui/StatusFilter';
import StatusModal from '../ui/StatusModal';
import ProcurementTable from './ProcurementTable';
import ProcurementForm from './ProcurementForm';
import ProcurementLetterPreview from './ProcurementLetterPreview';
import ProcurementDetailModal from './ProcurementDetailModal';
import './Procurement.css';

// ============================================================
// DATA DUMMY FALLBACK (Digunakan jika backend tidak tersedia)
// ============================================================
const defaultProcurements = [
  {
    id: 'proc-1',
    letter_number: '001/PENG-YAS/VI/2026',
    date: '10 Juni 2026',
    reporter_name: 'Ahmad Rizki',
    reporter_role: 'Petugas Perbaikan',
    items: [
      { name: 'Kipas Angin Dinding Maspion', unit: 'SMP', location: 'Ruang Kelas 4A', qty: 2, price: 350000, status: 'pending', notes: '' },
      { name: 'Papan Tulis Whiteboard', unit: 'SMP', location: 'Ruang Kelas 4B', qty: 1, price: 450000, status: 'pending', notes: '' }
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
      { name: 'Proyektor Epson EB-X400', unit: 'Yayasan', location: 'Lab Komputer', qty: 1, price: 5800000, status: 'approved', notes: '' }
    ],
    total_cost: 5800000,
    status: 'approved',
    closing_text: 'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  },
  {
    id: 'proc-3',
    letter_number: '003/PENG-YAS/VI/2026',
    date: '12 Juni 2026',
    reporter_name: 'Ahmad Rizki',
    reporter_role: 'Petugas Perbaikan',
    items: [
      { name: 'Meja Kerja Guru', unit: 'SMA', location: 'Ruang Guru', qty: 1, price: 500000, status: 'approved', notes: '' },
      { name: 'Kursi Lipat Kuliah', unit: 'SMA', location: 'Aula', qty: 5, price: 250000, status: 'rejected', notes: '' },
      { name: 'AC Split Panasonic 1 PK', unit: 'SMA', location: 'Ruang Kepala Sekolah', qty: 1, price: 3500000, status: 'rejected', notes: '' }
    ],
    total_cost: 5250000,
    status: 'rejected',
    closing_text: 'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  }
];

// ============================================================
// HELPER: Mapping status Backend <-> Frontend
// ============================================================
const statusBackendToFrontend = (status) => {
  switch (status) {
    case 'Menunggu': return 'pending';
    case 'Disetujui': return 'approved';
    case 'Ditolak': return 'rejected';
    default: return 'pending';
  }
};

// ============================================================
// HELPER: Format tanggal ISO -> format Indonesia
// ============================================================
const formatTanggalIndonesia = (dateStr) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// ============================================================
// HELPER: Kelompokkan data backend (per-record) -> format surat
// ============================================================
const groupBackendData = (records) => {
  const groups = {};

  records.forEach((record) => {
    // Buat group key dari tanggal pengajuan + id pengguna
    const groupKey = `${record.tgl_pengajuan}-${record.idpengguna}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: `group-${groupKey}`,
        letter_number: '', // akan di-generate setelah sorting
        date: formatTanggalIndonesia(record.tgl_pengajuan),
        raw_date: record.tgl_pengajuan,
        reporter_name: record.pengguna ? record.pengguna.nama : 'Unknown',
        reporter_role: record.pengguna ? (record.pengguna.jabatan || record.pengguna.nama_peran || '-') : '-',
        items: [],
        total_cost: 0,
        status: 'pending',
        closing_text: 'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
      };
    }

    const frontendStatus = statusBackendToFrontend(record.status_pengajuan);

    groups[groupKey].items.push({
      id: record.idpengadaan_aset, // Simpan ID backend untuk approval
      name: record.nama_barang,
      unit: record.unit || '-',
      location: record.lokasi_penempatan,
      qty: record.jumlah_barang,
      price: record.harga_barang,
      status: frontendStatus,
      notes: record.catatan_penolakan || ''
    });

    groups[groupKey].total_cost += record.jumlah_barang * record.harga_barang;
  });

  // Konversi groups ke array, sort by tanggal desc
  const grouped = Object.values(groups).sort((a, b) => 
    new Date(b.raw_date) - new Date(a.raw_date)
  );

  // Generate nomor surat dan tentukan status parent
  const getRomanMonth = (dateStr) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const d = new Date(dateStr);
    return roman[d.getMonth()];
  };

  grouped.forEach((group, index) => {
    const numStr = String(index + 1).padStart(3, '0');
    const romanMonth = getRomanMonth(group.raw_date);
    const year = new Date(group.raw_date).getFullYear();
    group.letter_number = `${numStr}/PENG-YAS/${romanMonth}/${year}`;

    // Tentukan status parent dari items
    const allApproved = group.items.every(i => i.status === 'approved');
    const allRejected = group.items.every(i => i.status === 'rejected');
    if (allApproved) group.status = 'approved';
    else if (allRejected) group.status = 'rejected';
    else group.status = 'pending';
  });

  return grouped;
};

export default function ProcurementListPage({ role, currentPath, hasWriteAccess = false, hasApprovalAccess = false }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('User');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedRole = localStorage.getItem('user_role');
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  // State Management
  const [view, setView] = useState('list'); // 'list', 'create', 'preview'
  const [procurements, setProcurements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null); // for detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsingBackend, setIsUsingBackend] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formLetterNumber, setFormLetterNumber] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formItems, setFormItems] = useState([{ name: '', unit: '', location: '', qty: 1, price: '' }]);
  const [formClosing, setFormClosing] = useState(
    'Demikian surat pengajuan pengadaan aset ini kami sampaikan. Besar harapan kami agar permohonan ini dapat disetujui demi kelancaran kegiatan belajar mengajar dan operasional sekolah. Atas perhatian dan persetujuannya, kami ucapkan terima kasih.'
  );

  // Decision Modal States (Yayasan)
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('approve'); // 'approve' or 'reject'
  const [decisionNotes, setDecisionNotes] = useState('');
  const [activeItemInfo, setActiveItemInfo] = useState(null); // { procurementId, itemIndex }

  // ============================================================
  // FETCH DATA: Dari API backend, fallback ke data dummy
  // ============================================================
  const loadProcurements = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/pengadaan_aset`,
        config
      );

      if (response.data && response.data.success && response.data.data) {
        const grouped = groupBackendData(response.data.data);
        setProcurements(grouped);
        setIsUsingBackend(true);
      } else {
        // API berhasil tapi data kosong
        setProcurements([]);
        setIsUsingBackend(true);
      }
    } catch (err) {
      console.warn("Backend API not reachable. Using dummy data for presentation.", err);
      // Fallback ke data dummy
      const stored = localStorage.getItem('simas_procurements');
      if (stored) {
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
      setIsUsingBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProcurements();
  }, [loadProcurements]);

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
    setFormItems([{ name: '', unit: '', location: '', qty: 1, price: '' }]);
    setView('create');
  };

  const handleAddItemRow = () => {
    setFormItems([...formItems, { name: '', unit: '', location: '', qty: 1, price: '' }]);
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
          [field]: field === 'qty' || field === 'price' ? (value === '' ? '' : Number(value)) : value
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
    const invalid = formItems.some(item => !item.name || !item.unit || !item.location || item.qty <= 0 || item.price === '');
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

  // ============================================================
  // SAVE: Kirim pengajuan ke API backend (per-item)
  // ============================================================
  const handleSaveProcurement = async () => {
    setIsSubmitting(true);

    // Format tanggal untuk backend (YYYY-MM-DD)
    const today = new Date();
    const tgl_pengajuan = today.toISOString().split('T')[0];

    if (isUsingBackend) {
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Kirim setiap item sebagai record terpisah ke backend
        const promises = formItems.map(item => 
          axios.post(`${API_BASE_URL}/api/pengadaan_aset`, {
            nama_barang: item.name,
            unit: item.unit,
            tgl_pengajuan: tgl_pengajuan,
            lokasi_penempatan: item.location,
            jumlah_barang: item.qty,
            harga_barang: item.price,
            alasan: formClosing // Gunakan kalimat penutup sebagai alasan
          }, config)
        );

        await Promise.all(promises);

        // Refresh data dari backend
        await loadProcurements();

        setView('list');
        setSuccessMessage('Surat pengajuan pengadaan aset berhasil dikirim ke sistem!');
        setIsSuccessOpen(true);
      } catch (err) {
        console.error("Error submitting procurement:", err);
        
        // Tampilkan pesan error yang spesifik
        const errorMsg = err.response?.data?.message || 'Gagal mengirim pengajuan. Silakan coba lagi.';
        alert(`Error: ${errorMsg}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback: simpan ke localStorage (mode offline)
      const newProc = {
        id: 'proc-' + Date.now(),
        letter_number: formLetterNumber,
        date: formDate,
        reporter_name: formName,
        reporter_role: formRole,
        items: formItems.map(item => ({ ...item, status: 'pending', notes: '' })),
        total_cost: calculateGrandTotal(),
        status: 'pending',
        closing_text: formClosing
      };

      const updated = [newProc, ...procurements];
      localStorage.setItem('simas_procurements', JSON.stringify(updated));
      setProcurements(updated);
      setView('list');
      setSuccessMessage('Surat pengajuan pengadaan aset berhasil dibuat dan disimpan (offline).');
      setIsSuccessOpen(true);
      setIsSubmitting(false);
    }
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

  // ============================================================
  // APPROVAL: Setujui / Tolak via API backend
  // ============================================================
  const handleOpenDecision = (procurementId, itemIndex, type) => {
    setActiveItemInfo({ procurementId, itemIndex });
    setDecisionType(type);
    setDecisionNotes('');
    setIsDecisionOpen(true);
  };

  const handleConfirmDecision = async (e) => {
    e.preventDefault();
    if (!activeItemInfo) return;

    const { procurementId, itemIndex } = activeItemInfo;

    if (isUsingBackend) {
      // Cari item yang akan di-approve/reject untuk mendapatkan ID backend
      const targetProc = procurements.find(p => p.id === procurementId);
      if (!targetProc || !targetProc.items[itemIndex]) return;

      const backendId = targetProc.items[itemIndex].id; // ID dari backend (idpengadaan_aset)
      
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        if (decisionType === 'approve') {
          await axios.patch(
            `${API_BASE_URL}/api/pengadaan_aset/${backendId}/setuju`,
            {},
            config
          );
        } else {
          await axios.patch(
            `${API_BASE_URL}/api/pengadaan_aset/${backendId}/tolak`,
            { catatan_penolakan: decisionNotes },
            config
          );
        }

        // Refresh data dari backend
        await loadProcurements();

        setIsDecisionOpen(false);
        setSuccessMessage(
          decisionType === 'approve' 
            ? 'Aset berhasil disetujui untuk pengadaan.' 
            : 'Pengadaan aset berhasil ditolak.'
        );
        setIsSuccessOpen(true);
      } catch (err) {
        console.error("Error processing decision:", err);
        const errorMsg = err.response?.data?.message || 'Gagal memproses keputusan. Silakan coba lagi.';
        alert(`Error: ${errorMsg}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback: update di localStorage (mode offline)
      const updatedProcurements = procurements.map(proc => {
        if (proc.id === procurementId) {
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
    }
  };

  const handleUpdateRejectNotes = async (procurementId, itemIndex, newNotes) => {
    if (isUsingBackend) {
      const targetProc = procurements.find(p => p.id === procurementId);
      if (!targetProc || !targetProc.items[itemIndex]) return;
      const backendId = targetProc.items[itemIndex].id;
      
      try {
        const token = localStorage.getItem('auth_token');
        await axios.patch(
          `${API_BASE_URL}/api/pengadaan_aset/${backendId}/tolak`,
          { catatan_penolakan: newNotes },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await loadProcurements();
        setSuccessMessage('Catatan penolakan berhasil diperbarui.');
        setIsSuccessOpen(true);
      } catch (error) {
        console.error('Error updating reject notes:', error);
        alert('Gagal memperbarui catatan penolakan.');
      }
    } else {
      // Mock local update
      const targetProc = procurements.find(p => p.id === procurementId);
      if (targetProc) {
        targetProc.items[itemIndex].notes = newNotes;
        const stored = localStorage.getItem('simas_procurements');
        if (stored) {
          const parsed = JSON.parse(stored);
          const idx = parsed.findIndex(p => p.id === procurementId);
          if (idx !== -1) {
            parsed[idx].items = targetProc.items;
            localStorage.setItem('simas_procurements', JSON.stringify(parsed));
          }
        }
      }
      setSuccessMessage('Catatan penolakan berhasil diperbarui (Lokal).');
      setIsSuccessOpen(true);
      setProcurements([...procurements]);
    }
  };

  const filteredProcurements = procurements.filter(item => 
    item.letter_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reporter_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {view === 'list' && (
          <>
            <PageHeader
              title={hasApprovalAccess ? "Persetujuan Pengadaan Aset" : "Pengadaan Aset"}
              subtitle={hasApprovalAccess ? "Tinjau, setujui, atau tolak berkas usulan pengadaan barang dari unit kerja" : "Ajukan dan kelola surat resmi pengadaan aset sekolah"}
              actionLabel={hasWriteAccess ? "Buat Pengajuan Baru" : null}
              onActionClick={handleOpenCreateForm}
              actionIcon={FiPlus}
            >
              <div className="procurement-filter-row">
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <SearchBar
                    placeholder="Cari berdasarkan nomor surat atau pengaju"
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <StatusFilter
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'Semua' },
                    { value: 'pending', label: 'Menunggu' },
                    { value: 'approved', label: 'Disetujui' },
                    { value: 'rejected', label: 'Ditolak' }
                  ]}
                />
              </div>
            </PageHeader>

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
                <FiLoader size={32} className="spin-animation" style={{ color: '#6366f1' }} />
                <p style={{ color: '#64748b', fontSize: '14px' }}>Memuat data pengadaan aset...</p>
              </div>
            ) : (
              <ProcurementTable
                procurements={filteredProcurements}
                onViewDetail={handleOpenDetailModal}
                onPreviewLetter={handleOpenPreviewFromList}
                statusFilter={statusFilter}
                showActions={hasApprovalAccess}
                showUnit={true}
                onApproveItem={(procId, itemIndex) => handleOpenDecision(procId, itemIndex, 'approve')}
                onRejectItem={(procId, itemIndex) => handleOpenDecision(procId, itemIndex, 'reject')}
                onUpdateRejectNotes={handleUpdateRejectNotes}
              />
            )}

            {/* Footer copyright */}
            <footer className="footer-copyright-text">
              © 2025 SIMAS - Sistem Informasi Manajemen Aset
            </footer>
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
          hasApprovalAccess ? (
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
          ) : (
            <ProcurementLetterPreview
              previewItem={previewItem}
              onBack={() => setView(backTo)}
              onSave={handleSaveProcurement}
              showConfirm={backTo === 'create'}
              isSubmitting={isSubmitting}
            />
          )
        )}

        <ProcurementDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          selectedItem={selectedItem}
        />

        {/* DECISION MODAL (Yayasan Only) */}
        {hasApprovalAccess && isDecisionOpen && (
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
                {decisionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Tolak Pengadaan Aset'}
              </h3>
              <p className="decision-modal-subtitle">
                {decisionType === 'approve' 
                  ? 'Apakah Anda yakin ingin menyetujui pengadaan aset ini?'
                  : 'Berikan alasan/catatan penolakan mengenai pengadaan barang ini.'}
              </p>

              <form onSubmit={handleConfirmDecision}>
                {decisionType === 'reject' ? (
                  <textarea
                    className="decision-textarea"
                    placeholder="Tuliskan alasan penolakan (wajib)..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    required
                  />
                ) : (
                  <div style={{ padding: '12px 16px', backgroundColor: '#fefce8', borderLeft: '4px solid #facc15', borderRadius: '4px', marginBottom: '24px', fontSize: '13px', color: '#854d0e', lineHeight: '1.5' }}>
                    <strong>Peringatan:</strong> Pengadaan aset yang telah Anda setujui akan dilanjutkan ke tahap pembelian dan statusnya tidak dapat dibatalkan melalui sistem ini.
                  </div>
                )}

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
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? 'Memproses...' 
                      : (decisionType === 'approve' ? 'Setujui Pengadaan' : 'Tolak Pengadaan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        <StatusModal
          isOpen={isSuccessOpen}
          type="success"
          title="Berhasil"
          message={successMessage}
          onConfirm={() => setIsSuccessOpen(false)}
        />
      </main>
    </DashboardLayout>
  );
}
