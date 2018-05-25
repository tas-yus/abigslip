import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'setting-group-edit',
    templateUrl: './setting-group-edit.component.html',
    styleUrls: ['./setting-group-edit.component.css']
})
export class SettingGroupEditComponent implements OnInit {
  group = null;
  ngGroup = null;
  loading = false;
  search = false;
  courses = [];
  types = ['KTB', 'GSB', 'CS', 'KTC'];
  errorMessage1 = null;
  limit = 100;
  addCourse = false;
  newCourse = false;
  showEdit = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isSetting()) {
      return this.router.navigate(['/home']);
    }
    this.getGroup();
  }

  getGroup() {
    const id = this.route.snapshot.params['id'];
    this.http.get<any>(`/api/settings/groups/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
      this.group = data;
      this.ngGroup = {title: data.title};
    }, (err) => {
      this.router.navigate(['/settings']);
    });
  }

  getCourseList() {
    this.http.get<any>(`/api/courses/list?token=${this.authService.getToken()}`)
    .subscribe((data) => {
      this.courses = data.courses;
    }, (err) => {
      this.errorMessage1 = err.error.message;
      this.loading = false;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }

  // onChangeOption(e) {
  //   if (e.srcTarget.value == 1) {
  //     this.newBook = false;
  //     this.getBookList();
  //   } else {
  //     this.books = [];
  //     this.newBook = true;
  //   }
  // }

  onAddCourse(courseId) {
    const groupId = this.route.snapshot.params['id'];
    this.http.post<any>(`/api/settings/groups/${groupId}/courses/${courseId}/?token=${this.authService.getToken()}`, {}).subscribe((data) => {
      this.group = data;
      this.courses = [];
      this.addCourse = false;
    }, (err) => {
      console.log(err);
    })
  }

  onDeleteCourse(courseId) {
    const groupId = this.route.snapshot.params['id'];
    this.http.delete<any>(`/api/settings/groups/${groupId}/courses/${courseId}/?token=${this.authService.getToken()}`, {}).subscribe((data) => {
      this.group = data;
      console.log(data);
      this.courses = [];
      this.addCourse = false;
    }, (err) => {
      console.log(err);
    })
  }

  existInArray(course, array) {
    var result = array.filter((o) => { return o._id.toString() == course._id.toString() });
    return !!result[0];
  }

  onEditGroup() {
    const id = this.route.snapshot.params['id'];
    this.http.put<any>(`/api/settings/groups/${id}?token=${this.authService.getToken()}`, {title: this.ngGroup.title}).subscribe((data) => {
      this.group = data;
      this.courses = [];
      this.addCourse = false;
      this.showEdit = false;
      this.getGroup();
    }, (err) => {
      console.log(err);
    })
  }
}
