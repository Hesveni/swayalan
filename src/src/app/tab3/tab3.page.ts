import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule
  ]
})
export class Tab3Page implements OnInit {

  // Login
  username: string = '';
  password: string = '';
  isLoggedIn: boolean = false;
  tabState: 'login' | 'admin' = 'login';

  // Produk
  namaProduk: string = '';
  kodeProduk: string = '';
  harga: string = '';
  kategori: string = '';
  stock: number | null = null;
  selectedFile: File | null = null;

  // Data Pembelian
  daftarpembelian: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.tabState = this.isLoggedIn ? 'admin' : 'login';

    if (this.isLoggedIn) {
      this.getDatapembelian();
    }
  }

  // ✅ Login Admin
  login() {
    this.http.post('http://localhost/swalayan/action.php', {
      aksi: 'login_admin',
      username: this.username,
      password: this.password
    }).subscribe(
      (res: any) => {
        if (res.success) {
          localStorage.setItem('isLoggedIn', 'true');
          this.isLoggedIn = true;
          this.tabState = 'admin';
          this.getDatapembelian();
          alert('Login berhasil!');
        } else {
          alert('Login gagal: ' + res.message);
        }
      },
      (err) => {
        alert('Terjadi kesalahan saat login.');
        console.error(err);
      }
    );
  }

  // ✅ Logout
  logout() {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn = false;
    this.tabState = 'login';
    this.username = '';
    this.password = '';
    this.daftarpembelian = [];
  }

  // ✅ Ambil Data Pembelian
  getDatapembelian() {
    this.http.get<any>('http://localhost/swalayan/action.php?aksi=get_pembelian')
      .subscribe(
        (res) => {
          if (res.success) {
            this.daftarpembelian = res.result;
          } else {
            console.error('Gagal mengambil data pembelian:', res.msg);
          }
        },
        (err) => {
          console.error('Gagal mengambil data pembelian:', err);
        }
      );
  }

  // ✅ Tambah Produk
  tambahProduk() {
    if (!this.namaProduk || !this.kodeProduk || !this.harga || !this.kategori || this.stock === null || !this.selectedFile) {
      alert('Mohon lengkapi semua kolom dan upload gambar!');
      return;
    }

    const formData = new FormData();
    formData.append('aksi', 'add_produk');
    formData.append('namaproduk', this.namaProduk);
    formData.append('kodeproduk', this.kodeProduk);
    formData.append('harga', this.harga);
    formData.append('kategori', this.kategori);
    formData.append('stock', String(this.stock));
    formData.append('gambar', this.selectedFile);

    this.http.post('http://localhost/swalayan/action.php', formData)
      .subscribe(
        (res: any) => {
          if (res.success) {
            alert('Produk berhasil ditambahkan!');
            this.resetFormProduk();
          } else {
            alert('Gagal menambahkan produk: ' + res.msg);
          }
        },
        (err) => {
          console.error('Error saat simpan produk:', err);
        }
      );
  }

  // ✅ Handle File Input
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // ✅ Reset Form Produk setelah submit
  resetFormProduk() {
    this.namaProduk = '';
    this.kodeProduk = '';
    this.harga = '';
    this.kategori = '';
    this.stock = null;
    this.selectedFile = null;
  }
}
