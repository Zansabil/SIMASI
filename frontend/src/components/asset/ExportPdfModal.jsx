import React, { useState } from 'react';
import { FiX, FiPrinter, FiCalendar, FiFileText, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { exportAssetPDF, triggerBlobDownload } from '../../services/assetService';
import './ExportPdfModal.css';

const PRESET_OPTIONS = [
  { id: 'all', label: 'Semua Waktu', desc: 'Unduh seluruh data aset yang tersimpan' },
  { id: '1_week', label: '1 Minggu Terakhir', desc: 'Aset dalam 7 hari terakhir' },
  { id: '1_month', label: '1 Bulan Terakhir', desc: 'Aset dalam 30 hari terakhir' },
  { id: 'this_month', label: 'Bulan Ini', desc: 'Aset yang dicatat pada bulan berjalan' },
  { id: 'custom', label: 'Pilih Tanggal Bebas', desc: 'Tentukan rentang tanggal awal & akhir' }
];

export default function ExportPdfModal({ isOpen, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState('all');
  const [dateField, setDateField] = useState('tgl_diperoleh'); // 'tgl_diperoleh' | 'tgl_dibuat'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    setErrorMessage('');
    
    const now = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (presetId === '1_week') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (presetId === '1_month') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (presetId === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(now));
    } else if (presetId === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedPreset === 'custom') {
      if (!startDate || !endDate) {
        setErrorMessage('Silakan tentukan tanggal awal dan tanggal akhir.');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setErrorMessage('Tanggal awal tidak boleh lebih besar dari tanggal akhir.');
        return;
      }
    }

    setIsExporting(true);

    try {
      const params = {
        periode: selectedPreset,
        date_field: dateField
      };

      if (selectedPreset !== 'all' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const blobData = await exportAssetPDF(params);
      
      const timeStamp = new Date().toISOString().slice(0, 10);
      const filename = `Laporan_Aset_SIMASI_${selectedPreset}_${timeStamp}.pdf`;

      triggerBlobDownload(blobData, filename);
      onClose();
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
      const msg = err.response?.data?.message || 'Gagal membuat file PDF dari server. Pastikan server aktif.';
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-pdf-overlay" onClick={onClose}>
      <div className="export-pdf-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-pdf-header">
          <div className="export-pdf-title-group">
            <div className="export-pdf-icon-badge">
              <FiPrinter size={20} />
            </div>
            <div>
              <h3 className="export-pdf-title">Ekspor Laporan PDF</h3>
              <p className="export-pdf-subtitle">Pilih rentang waktu data aset yang ingin dicetak</p>
            </div>
          </div>
          <button className="export-pdf-close-btn" onClick={onClose} aria-label="Tutup">
            <FiX size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleDownload} className="export-pdf-body">
          {errorMessage && (
            <div className="export-pdf-alert-error">
              <FiAlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Basis Filter Tanggal */}
          <div className="export-form-section">
            <label className="export-section-label">Berdasarkan Tanggal:</label>
            <div className="export-radio-group">
              <label className={`export-radio-card ${dateField === 'tgl_diperoleh' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dateField"
                  value="tgl_diperoleh"
                  checked={dateField === 'tgl_diperoleh'}
                  onChange={() => setDateField('tgl_diperoleh')}
                />
                <span className="radio-text">Tanggal Diperoleh (Pembelian Fisik)</span>
              </label>
              <label className={`export-radio-card ${dateField === 'tgl_dibuat' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dateField"
                  value="tgl_dibuat"
                  checked={dateField === 'tgl_dibuat'}
                  onChange={() => setDateField('tgl_dibuat')}
                />
                <span className="radio-text">Tanggal Input ke Sistem (Waktu Entri)</span>
              </label>
            </div>
          </div>

          {/* Pilihan Periode Waktu */}
          <div className="export-form-section">
            <label className="export-section-label">Pilih Periode Waktu:</label>
            <div className="export-presets-grid">
              {PRESET_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  className={`export-preset-btn ${selectedPreset === opt.id ? 'active' : ''}`}
                  onClick={() => handlePresetChange(opt.id)}
                >
                  <div className="preset-btn-top">
                    <span className="preset-label">{opt.label}</span>
                    {selectedPreset === opt.id && <FiCheck className="preset-check" size={16} />}
                  </div>
                  <span className="preset-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Tanggal Kustom (Jika Custom atau preset selain All) */}
          {selectedPreset === 'custom' && (
            <div className="export-custom-date-container">
              <div className="export-date-field">
                <label>Dari Tanggal (Mulai)</label>
                <div className="date-input-wrapper">
                  <FiCalendar className="date-input-icon" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required={selectedPreset === 'custom'}
                  />
                </div>
              </div>
              <div className="export-date-field">
                <label>Sampai Tanggal (Selesai)</label>
                <div className="date-input-wrapper">
                  <FiCalendar className="date-input-icon" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required={selectedPreset === 'custom'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Keterangan Ringkas Periode Terpilih */}
          <div className="export-summary-box">
            <FiFileText size={18} className="summary-icon" />
            <div className="summary-text">
              {selectedPreset === 'all' ? (
                <span>Laporan akan mencakup <strong>seluruh data aset</strong> tanpa batasan tanggal.</span>
              ) : (
                <span>
                  Laporan akan mencakup data aset mulai tanggal <strong>{startDate || '-'}</strong> s/d <strong>{endDate || '-'}</strong>.
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="export-pdf-footer">
            <button
              type="button"
              className="export-btn-cancel"
              onClick={onClose}
              disabled={isExporting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="export-btn-submit"
              disabled={isExporting}
            >
              <FiPrinter size={16} />
              {isExporting ? 'Memproses PDF...' : 'Unduh Laporan PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
