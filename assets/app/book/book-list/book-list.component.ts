import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'book-list',
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books = [];
  loading = false;
  search = false;
  types = ['KTB', 'GSB', 'CS'];
  errorMessage1 = null;
  count = null;
  limit = 100;
  branch = this.authService.isAdmin()? 0: this.authService.getBranch();
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
  month = new Date().getMonth();
  year = new Date().getFullYear();

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    this.getBooks(this.branch);
  }

  getBooks(branch) {
    this.loading = true;
    this.http.get<any>(`/api/books?token=${this.authService.getToken()}&&limit=${this.limit}&&month=${this.month}&&year=${this.year}&&branch=${branch}`)
    .subscribe((data) => {
      this.books = data.books;
      this.loading = false;
    }, (err) => {
      this.errorMessage1 = err.error.message;
      this.loading = false;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }

  // getDate(date) {
  //   var newDate = new Date(date)
  //   return this.updateDate(newDate.toLocaleDateString()) +", "+ newDate.toLocaleTimeString();
  // }
  //
  // updateDate(date) {
  //   var newDate = new Date(date).toLocaleDateString();
  //   var parsedDate = newDate.split("/");
  //   if (Number(parsedDate[0]) < 10) {
  //     parsedDate[0] = "0" + parsedDate[0]
  //   }
  //   if (Number(parsedDate[1]) < 10) {
  //     parsedDate[1] = "0" + parsedDate[1]
  //   }
  //   return `${parsedDate[1]}-${parsedDate[0]}-${parsedDate[2]}`;
  // }
  getMonth() {
    return this.months[new Date().getMonth()];
  }

  getYear(offset) {
    return (new Date().getFullYear())-Number(offset);
  }

  // countBooks(books) {
  //   books.forEach()
  // }
  //
  // selectFilter(e) {
  //   this.limit = e.srcElement.value;
  //   this.getOrders();
  // }
}
