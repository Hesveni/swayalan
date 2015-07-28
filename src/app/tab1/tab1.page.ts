import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page implements OnInit {

  daftarProduk: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.ambilProduk();
  }

  ambilProduk() {
    this.http.get<any>('https://hesvenita.ti-zone.io/action.php?aksi=get_produk')
      .subscribe(
        res => {
          if (res.success) {
            this.daftarProduk = res.result;
          } else {
            console.error('Gagal ambil produk:', res.msg);
          }
        },
        err => {
          console.error('Error HTTP:', err);
        }
      );
  }
}
