<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StatusLaporanKerusakanMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pesan;
    public $tipe;
    public $nama_pengguna;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($pesan, $tipe, $nama_pengguna)
    {
        $this->pesan = $pesan;
        $this->tipe = $tipe;
        $this->nama_pengguna = $nama_pengguna;
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
        return [];
    }
}
