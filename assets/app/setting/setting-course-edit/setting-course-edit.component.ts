import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'setting-course-edit',
    templateUrl: './setting-course-edit.component.html',
    styleUrls: ['./setting-course-edit.component.css']
})
export class SettingCourseEditComponent implements OnInit {
  course = null;
  ngCourse = null;
  loading = false;
  search = false;
  books = [];
  types = ['KTB', 'GSB', 'CS'];
  errorMessage1 = null;
  limit = 100;
  addBook = false;
  newBook = false;
  showEdit = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isSetting()) {
      return this.router.navigate(['/home']);
    }
    this.getCourse();
  }

  getCourse() {
    const id = this.route.snapshot.params['id'];
    this.http.get<any>(`/api/courses/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
      this.course = data;
      this.ngCourse = {
        title: data.title,
        numBook: data.numBook,
        strict: data.strict
      };
    }, (err) => {
      this.router.navigate(['/settings']);
    });
  }

  getBookList() {
    this.loading = true;
    this.http.get<any>(`/api/books/list?token=${this.authService.getToken()}`)
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

  // onChangeOption(e) {
  //   if (e.srcTarget.value == 1) {
  //     this.newBook = false;
  //     this.getBookList();
  //   } else {
  //     this.books = [];
  //     this.newBook = true;
  //   }
  // }

  onAddBook(bookId) {
    const courseId = this.route.snapshot.params['id'];
    this.http.post<any>(`/api/courses/${courseId}/books/${bookId}/?token=${this.authService.getToken()}`, {}).subscribe((data) => {
      this.course = data;
      this.books = [];
      this.addBook = false;
    }, (err) => {
      console.log(err);
    })
  }

  onDeleteBook(bookId) {
    const courseId = this.route.snapshot.params['id'];
    this.http.delete<any>(`/api/courses/${courseId}/books/${bookId}/?token=${this.authService.getToken()}`, {}).subscribe((data) => {
      this.course = data;
      this.books = [];
      this.addBook = false;
    }, (err) => {
      console.log(err);
    })
  }

  existInArray(book, array) {
    var result = array.filter((o) => { return o._id.toString() == book._id.toString() });
    return !!result[0];
  }

  onEditCourse() {
    const courseId = this.route.snapshot.params['id'];
    const body = {title: this.ngCourse.title, numBook: this.ngCourse.numBook, strict: this.ngCourse.strict};
    this.http.put<any>(`/api/courses/${courseId}?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.showEdit = false;
      this.getCourse();
      console.log(data);
    }, (err) => {
      console.log(err);
    });
  }
}
