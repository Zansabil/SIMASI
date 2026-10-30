import React, { useState, useRef } from 'react';
import { 
  FiX, 
  FiUploadCloud, 
  FiDownload, 
  FiFileText, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiTrash2 
} from 'react-icons/fi';
import { 
  importAssetExcel, 
  downloadAssetTemplate, 
  triggerBlobDownload 
} from '../../services/assetService';
import './ImportExcelModal.css';

export default function ImportExcelModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage('');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    setErrorMessage('');
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv.');
      setSelectedFile(null);
      return;
    }

    // Maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar (maksimal 5MB).');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setErrorMessage('');
    try {
      const blob = await downloadAssetTemplate();
      triggerBlobDownload(blob, 'Template_Impor_Aset_SIMASI.csv');
    } catch (err) {
      console.error('Gagal mengunduh template:', err);
      setErrorMessage('Gagal mengunduh template Excel. Silakan coba lagi.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Silakan pilih file Excel terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await importAssetExcel(selectedFile);
      const msg = response?.message || 'Data aset dari Excel berhasil diimpor ke sistem.';
      
      if (onSuccess) {
        onSuccess(msg);
      }
      onClose();
    } catch (err) {
      console.error('Gagal mengimpor Excel:', err);
      const backendMsg = err.response?.data?.message || err.message;
      setErrorMessage(backendMsg || 'Gagal memproses file Excel. Pastikan format kolom sesuai dengan template.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="import-excel-overlay" onClick={onClose}>
      <div className="import-excel-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="import-excel-header">
          <div className="import-excel-title-group">
            <div className="import-excel-icon-badge">
              <FiUploadCloud size={22} />
            </div>
            <div>
              <h3 className="import-excel-title">Impor Data Aset dari Excel</h3>
              <p className="import-excel-subtitle">Tambah banyak data aset sekaligus melalui file Excel atau spreadsheet</p>
            </div>
          </div>
          <button className="import-excel-close-btn" onClick={onClose} aria-label="Tutup">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleUploadSubmit} className="import-excel-body">
          {errorMessage && (
            <div className="import-excel-alert-error">
              <FiAlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Langkah 1: Template Download */}
          <div className="import-step-card">
            <div className="import-step-info">
              <span className="import-step-number">1</span>
              <div>
                <h4 className="import-step-title">Gunakan Template Standar</h4>
                <p className="import-step-desc">
                  Pastikan kolom data Anda cocok (Nama Aset, Unit, Ruangan, Jumlah, Kondisi, dll) agar tidak terjadi kesalahan.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="import-btn-template"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
            >
              <FiDownload size={15} />
              {isDownloadingTemplate ? 'Mengunduh...' : 'Unduh Template'}
            </button>
          </div>

          {/* Langkah 2: Upload Zone */}
          <div className="import-step-section">
            <div className="import-step-header">
              <span className="import-step-number">2</span>
              <h4 className="import-step-title">Unggah File yang Sudah Diisi</h4>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />

            {!selectedFile ? (
              <div
                className={`import-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="dropzone-icon-circle">
                  <FiUploadCloud size={28} />
                </div>
                <p className="dropzone-text-main">
                  Tarik & letakkan file ke sini, atau <span className="dropzone-browse">Pilih File</span>
                </p>
                <p className="dropzone-text-sub">Mendukung format .xlsx, .xls, .csv (Maksimal 5MB)</p>
              </div>
            ) : (
              <div className="import-file-selected">
                <div className="file-selected-left">
                  <div className="file-icon-box">
                    <FiFileText size={24} />
                  </div>
                  <div className="file-info-details">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={handleRemoveFile}
                  title="Hapus file"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Catatan Bantuan Kolom */}
          <div className="import-columns-hint">
            <FiCheckCircle size={15} className="hint-icon" />
            <span className="hint-text">
              Kolom wajib terisi: <strong>Nama Aset</strong>, <strong>Jenis Aset</strong>, <strong>Unit</strong>, <strong>Ruangan</strong>, <strong>Jumlah</strong>, <strong>Kondisi</strong>, dan <strong>Tanggal Diperoleh</strong>.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="import-excel-footer">
            <button
              type="button"
              className="import-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="import-btn-submit"
              disabled={isLoading || !selectedFile}
            >
              <FiUploadCloud size={16} />
              {isLoading ? 'Sedang Memproses Data...' : 'Mulai Impor Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
