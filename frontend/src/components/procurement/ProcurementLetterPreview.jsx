import React from 'react';
import { FiPrinter } from 'react-icons/fi';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export default function ProcurementLetterPreview({ 
  previewItem, 
  onBack, 
  onSave, 
  showConfirm 
}) {
  return (
    <div className="letter-preview-screen">
      <div className="letter-actions-bar">
        <button className="btn-cancel" onClick={onBack}>Kembali</button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {showConfirm && (
            <button className="btn-submit-proc" onClick={onSave}>Kirim & Simpan Pengajuan</button>
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
              <th style={{ width: '100px' }}>Unit</th>
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
                <td>{item.unit}</td>
                <td>{item.location}</td>
                <td className="text-center">{item.qty} Unit</td>
                <td className="text-right">{formatRupiah(item.price)}</td>
                <td className="text-right" style={{ fontWeight: 'bold' }}>{formatRupiah(item.qty * item.price)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold', padding: '8px' }}>Grand Total Biaya:</td>
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
            <span className="sig-role">{previewItem.reporter_role} {previewItem.reporter_unit ? `(Unit ${previewItem.reporter_unit})` : ''}</span>
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
  );
}
