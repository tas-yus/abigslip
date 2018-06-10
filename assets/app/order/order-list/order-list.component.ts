import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders = [];
  loading = false;
  search = false;
  types = ['KTB', 'GSB', 'CS', 'KTC', 'FREE', 'เสีย'];
  typeOptions = ['All', 'KTB', 'GSB', 'CS', 'KTC', 'FREE', 'ไม่ match', 'เสีย'];
  errorMessage1 = null;
  count = null;
  type = 0;
  limit = 100;
  month = new Date().getMonth();
  year = new Date().getFullYear();
  months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม'
  , 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  branchArray: any = [
    "Admin",
    "BG", "BW", "BB",
    "BC", "BS", "BP",
    "BNG", "BR", "BH",
    "BU", "BPK", "BN",
    "BA", "BQ"
  ];

  @ViewChild('selectMode') selectMode;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    this.getOrders();
  }

  getOrders() {
    this.loading = true;
    this.http.get<any>(`/api/orders?token=${this.authService.getToken()}&&limit=${this.limit}&&month=${this.month}&&year=${this.year}&&type=${this.type}`).subscribe((data) => {
      this.orders = data.orders;
      this.count = data.count;
      this.loading = false;
    }, (err) => {
      this.errorMessage1 = err.error.message;
      this.loading = false;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }

  getDate(date) {
    var newDate = new Date(date)
    return this.updateDate(newDate.toLocaleDateString()) +", "+ newDate.toLocaleTimeString();
  }

  updateDate(date) {
    var newDate = new Date(date).toLocaleDateString();
    var parsedDate = newDate.split("/");
    if (Number(parsedDate[0]) < 10) {
      parsedDate[0] = "0" + parsedDate[0]
    }
    if (Number(parsedDate[1]) < 10) {
      parsedDate[1] = "0" + parsedDate[1]
    }
    return `${parsedDate[1]}-${parsedDate[0]}-${parsedDate[2]}`;
  }

  selectFilter(e) {
    this.limit = e.srcElement.value;
    this.getOrders();
  }

  getMonth() {
    return this.months[new Date().getMonth()];
  }

  getYear(offset) {
    return (new Date().getFullYear())-Number(offset);
  }
}
