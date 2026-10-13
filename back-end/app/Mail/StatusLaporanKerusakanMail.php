<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Support\Facades\Storage;

class StatusLaporanKerusakanMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pesan;
    public $tipe;
    public $nama_pengguna;
    public $keterangan;
    public $hasil;
    public $biaya;
    public $foto_perbaikan;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($pesan, $tipe, $nama_pengguna, $keterangan = null, $hasil = null, $biaya = null, $foto_perbaikan = null)
    {
        $this->pesan = $pesan;
        $this->tipe = $tipe;
        $this->nama_pengguna = $nama_pengguna;
        $this->keterangan = $keterangan;
        $this->hasil = $hasil;
        $this->biaya = $biaya;
        $this->foto_perbaikan = $foto_perbaikan;
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope()
    {
        return new Envelope(
            subject: 'Pemberitahuan: ' . $this->tipe,
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
            view: 'emails.status_laporan',
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
        if ($this->foto_perbaikan && Storage::disk('public')->exists($this->foto_perbaikan)) {
            $path = Storage::disk('public')->path($this->foto_perbaikan);
            $ext = pathinfo($path, PATHINFO_EXTENSION) ?: 'jpg';
            $attachments[] = Attachment::fromPath($path)
                ->as('foto_hasil_perbaikan.' . $ext)
                ->withMime(mime_content_type($path) ?: 'image/jpeg');
        }
        return $attachments;
    }
}
