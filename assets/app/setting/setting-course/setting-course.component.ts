import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'setting-course',
    templateUrl: './setting-course.component.html',
    styleUrls: ['./setting-course.component.css']
})
export class SettingCourseComponent implements OnInit {
  courses = [];
  addCourse = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isSetting()) {
      return this.router.navigate(['/home']);
    }
    this.requestCourses();
  }

  requestCourses() {
    this.http.get<any[]>(`/api/settings/courses?token=${this.authService.getToken()}`).subscribe((data) => {
      this.courses = data;
    }, (err) => {
      console.log(err);
    });
  }

  onAddCourse(form: NgForm) {
    var body = {title: form.value.title, numBook: form.value.numBook};
    this.http.post<any>(`/api/settings/courses?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.router.navigate([`/settings/courses/${data._id}/edit`]);
    }, (err) => {
      console.log(err);
    });
  }

}
