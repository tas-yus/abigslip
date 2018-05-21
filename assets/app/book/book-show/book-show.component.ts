import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'book-show',
    templateUrl: './book-show.component.html',
    styleUrls: ['./book-show.component.css']
})
export class BookShowComponent implements OnInit {
  book = null;
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
    this.getBook(this.branch);
  }

  getBook(branch) {
    const id = this.route.snapshot.params['id'];
    this.http.get<any>(`/api/books/${id}?token=${this.authService.getToken()}&&limit=${this.limit}&&month=${this.month}&&year=${this.year}&&branch=${branch}`)
    .subscribe((data) => {
      this.book = data;
    }, (err) => {
      this.router.navigate(['/home']);
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

  getMonth() {
    return this.months[new Date().getMonth()];
  }

  getYear(offset) {
    return (new Date().getFullYear())-Number(offset);
  }

}
