import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'order-search',
    templateUrl: './order-search.component.html',
    styleUrls: ['./order-search.component.css']
})
export class OrderSearchComponent implements OnInit {
  loading = false;
  errorMessage3 = null;
  searchSlipResults = [];
  date = null;

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {}

  searchSlip(code, date) {
    var query = '';
    if (code && date) {
      query += `&&code=${code}&&date=${date}`;
    } else if (code && !date) {
      query += `&&code=${code}`;
    } else if (!code && date) {
      query += `&&date=${date}`;
    } else {
      console.log("error");
    }
    this.http.get<any[]>(`/api/orders/search?token=${this.authService.getToken()}` + query).subscribe((data) => {
      this.searchSlipResults = data;
    }, (err) => {
      this.searchSlipResults = [];
      this.errorMessage3 = err.error.message;
      setTimeout(() => {
        this.errorMessage3 = null;
      }, 3000);
    });
  }

  getDate(date) {
    return new Date(date).toLocaleDateString();
  }
}
