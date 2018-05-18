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
  types = ['KTB', 'GSB', 'CS'];
  limit = 100;
  count = null;
  loading = false;
  search = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.getStudents()
  }

  selectFilter(e) {
    this.limit = e.srcElement.value;
    this.getStudents();
  }

  getStudents() {
    this.loading = true;;
    this.http.get<any>(`/api/students?token=${this.authService.getToken()}&&limit=${this.limit}`).subscribe((data) => {
      this.students = this.filterStudents(data.students);
      this.count = data.count;
      this.loading = false;
    }, (err) => {
      this.router.navigate(['/home']);
    });
  }

  getDate(date) {
    return new Date(date).toLocaleString();
  }

  filterStudents(array) {
    return array.filter((o) => { return o.lastOrder });
  }
}
