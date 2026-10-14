<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Support\Facades\Storage;

class LaporanKerusakanBaruMail extends Mailable
{
    use Queueable, SerializesModels;

    public $laporan;
    public $aset;
    public $petugas;
    public $pelapor;
    public $kodeUnit;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($laporan, $aset, $petugas, $pelapor = null, $kodeUnit = null)
    {
        $this->laporan = $laporan;
        $this->aset = $aset;
        $this->petugas = $petugas;
        $this->pelapor = $pelapor;
        $this->kodeUnit = $kodeUnit;
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope()
    {
        $namaAset = $this->aset ? $this->aset->nama_aset : 'Aset';
        $unitText = $this->kodeUnit ? " (Unit {$this->kodeUnit})" : '';
        return new Envelope(
            subject: '[SIMASI] Laporan Kerusakan Baru: ' . $namaAset . $unitText,
        );
    }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        return new Content(
            view: 'emails.laporan_kerusakan_baru',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array
     */
    public function attachments()
    {
        $attachments = [];
        try {
            if ($this->laporan && $this->laporan->lampiran && Storage::disk('public')->exists($this->laporan->lampiran)) {
                $path = Storage::disk('public')->path($this->laporan->lampiran);
                $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION) ?: 'jpg');
                $mimeMap = [
                    'jpg'  => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'png'  => 'image/png',
                    'webp' => 'image/webp',
                ];
                $mime = $mimeMap[$ext] ?? 'image/jpeg';
                $attachments[] = Attachment::fromPath($path)
                    ->as('foto_bukti_kerusakan.' . $ext)
                    ->withMime($mime);
            }
        } catch (\Throwable $t) {
            // Abaikan error attachment agar email utama tetap terkirim
        }
        return $attachments;
    }
}
