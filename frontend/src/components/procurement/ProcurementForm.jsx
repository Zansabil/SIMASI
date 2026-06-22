import React from 'react';
import { FiPlus, FiTrash2, FiPrinter } from 'react-icons/fi';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export default function ProcurementForm({
  availableUnits = [],
  formLetterNumber,
  formDate,
  formName,
  setFormName,
  formRole,
  setFormRole,
  formItems,
  onItemChange,
  onAddItemRow,
  onRemoveItemRow,
  formClosing,
  setFormClosing,
  onSubmit,
  onCancel,
  grandTotal,
}) {
  return (
    <div className="form-panel">
      <h3 className="form-panel-title">Buat Pengajuan Pengadaan Aset</h3>
      <p className="form-panel-subtitle">Silakan isi rincian barang/aset yang diajukan dalam tabel di bawah ini.</p>

      <form onSubmit={onSubmit}>
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
                <th style={{ width: '140px' }}>Unit <span style={{ color: '#ef4444' }}>*</span></th>
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
                      onChange={(e) => onItemChange(index, 'name', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <select
                      className="form-field-input"
                      value={item.unit || ''}
                      onChange={(e) => onItemChange(index, 'unit', e.target.value)}
                      required
                    >
                      <option value="" disabled hidden>Unit</option>
                      {availableUnits.length > 0 ? (
                        availableUnits.map((u, i) => (
                          <option key={u.id || i} value={u.id || u}>{u.nama_unit || u}</option>
                        ))
                      ) : (
                        <option value="" disabled>Belum ada Master Unit</option>
                      )}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="Lokasi..."
                      value={item.location}
                      onChange={(e) => onItemChange(index, 'location', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-field-input"
                      min="0"
                      placeholder="0"
                      value={item.qty}
                      onChange={(e) => onItemChange(index, 'qty', e.target.value)}
                      onFocus={(e) => e.target.select()}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-field-input"
                      placeholder="Rp..."
                      value={item.price}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        onItemChange(index, 'price', val);
                      }}
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
                      onClick={() => onRemoveItemRow(index)}
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
          <button type="button" className="btn-add-item-row" onClick={onAddItemRow}>
            <FiPlus size={16} /> Tambah Baris Aset
          </button>
        </div>

        <div className="grand-total-row">
          <span className="grand-total-label">Estimasi Grand Total:</span>
          <span className="grand-total-val">{formatRupiah(grandTotal)}</span>
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
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Batal
          </button>
          <button type="submit" className="btn-preview">
            <FiPrinter size={16} /> Pratinjau Surat
          </button>
        </div>
      </form>
    </div>
  );
}
