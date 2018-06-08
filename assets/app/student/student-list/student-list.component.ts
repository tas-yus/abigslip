import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'student-list',
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students = [];
  success = null;
  types = ['KTB', 'GSB', 'CS', 'KTC', 'FREE'];
  limit = 500;
  count = null;
  loading = false;
  search = false;
  branchArray: any = [
    "Admin",
    "BG", "BW", "BB",
    "BC", "BS", "BP",
    "BNG", "BR", "BH",
    "BU", "BPK", "BN",
    "BA", "BQ"
  ];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.getStudents();
  }

  selectFilter(e) {
    this.limit = e.srcElement.value;
    this.getStudents();
  }

  getStudents() {
    this.loading = true;;
    this.http.get<any>(`/api/students?token=${this.authService.getToken()}&&limit=${this.limit}`).subscribe((data) => {
      this.students = data.students;
      this.count = data.count;
      this.loading = false;
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
}
