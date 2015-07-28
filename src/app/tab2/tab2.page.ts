import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule
  ]
})
export class Tab2Page implements OnInit {

  // Data pembelian
  kode_pembelian: string = '';
  tanggal: string = '';
  nama_produk: string = '';
  kode_produk: string = '';
  harga_beli: number = 0;
  jumlah: number = 0;
  total_harga: number = 0;
  metode_pembayaran: string = '';
  keterangan: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.generateKodePembelian();
  }

  // Generate kode pembelian otomatis
  generateKodePembelian() {
    const now = new Date();
    const tanggal = now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    const acak = Math.floor(100 + Math.random() * 900);
    this.kode_pembelian = 'PB-' + tanggal + '-' + acak;
  }

  // Hitung total harga otomatis
  hitungTotalHarga() {
    this.total_harga = this.harga_beli * this.jumlah;
  }

  // Submit data ke server
  submitPembelian() {
    // ✅ Validasi input kosong atau tidak valid
    if (
      !this.tanggal ||
      !this.nama_produk.trim() ||
      !this.kode_produk.trim() ||
      this.harga_beli <= 0 ||
      this.jumlah <= 0 ||
      !this.metode_pembayaran
    ) {
      alert('⚠️ Semua field wajib diisi dengan benar!');
      return;
    }

    const data = {
      aksi: 'add_pembelian',
      kode_pembelian: this.kode_pembelian,
      tanggal: this.tanggal,
      nama_produk: this.nama_produk,
      kode_produk: this.kode_produk,
      harga_beli: this.harga_beli,
      jumlah: this.jumlah,
      total_harga: this.total_harga,
      metode_pembayaran: this.metode_pembayaran,
      keterangan: this.keterangan,
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('https://hesvenita.ti-zone.io/action.php', JSON.stringify(data), { headers })
      .subscribe(
        (res: any) => {
          if (res.success) {
            alert('✅ Pembelian berhasil disimpan!\nKode: ' + res.kode);
            this.clearForm();
          } else {
            alert('❌ Gagal menyimpan: ' + res.msg);
          }
        },
        (err: any) => {
          console.error(err);
          alert('❌ Terjadi kesalahan saat mengirim data ke server.');
        }
      );
  }

  // Kosongkan form setelah submit
  clearForm() {
    this.tanggal = '';
    this.nama_produk = '';
    this.kode_produk = '';
    this.harga_beli = 0;
    this.jumlah = 0;
    this.total_harga = 0;
    this.metode_pembayaran = '';
    this.keterangan = '';
    this.generateKodePembelian();
  }
}
