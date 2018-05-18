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
  types = ['KTB', 'GSB', 'CS'];
  errorMessage1 = null;
  count = null;
  limit = 100;

  @ViewChild('selectMode') selectMode;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    this.getOrders();
  }

  getOrders() {
    this.loading = true;
    this.http.get<any>(`/api/orders?token=${this.authService.getToken()}&&limit=${this.limit}`).subscribe((data) => {
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
    return new Date(date).toLocaleString();
  }

  selectFilter(e) {
    this.limit = e.srcElement.value;
    this.getOrders();
  }
}
