import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'student-search',
    templateUrl: './student-search.component.html',
    styleUrls: ['./student-search.component.css']
})
export class StudentSearchComponent implements OnInit {
  loading = false;
  errorMessage2 = null;
  searchResults = [];

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {}

  search(value) {
    var query = value === ''? '' : `&&name=${value}`;
    if (value) {
      this.http.get<any[]>(`/api/students/search?token=${this.authService.getToken()}` + query).subscribe((data) => {
        this.searchResults = data;
      }, (err) => {
        this.searchResults = [];
        this.errorMessage2 = err.error.message;
        setTimeout(() => {
          this.errorMessage2 = null;
        }, 3000);
      });
    }
  }
}
