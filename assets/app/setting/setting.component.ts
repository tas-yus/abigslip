import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'setting',
    templateUrl: './setting.component.html',
    styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  courses= [];
  loading = false;
  search = false;
  types = ['KTB', 'GSB', 'CS'];
  errorMessage1 = null;
  limit = 100;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isSetting()) {
      return this.router.navigate(['/home']);
    }
    this.http.get<any[]>(`/api/courses?token=${this.authService.getToken()}`).subscribe((data) => {
      this.courses = data;
    }, (err) => {

    });
  }

}
