import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { IMyDpOptions} from 'mydatepicker';

@Component({
    selector: 'student-show',
    templateUrl: './student-show.component.html',
    styleUrls: ['./student-show.component.css']
})
export class StudentShowComponent implements OnInit {
  student = null;
  type = null;
  date = null;
  success = null;
  price = null;
  types = ['KTB', 'GSB', 'CS', 'KTC'];
  model = null;
  groups = [];
  courses = [];
  books = [];
  group =  0;
  course = 0;
  selectedBooks = [];
  @ViewChild('selectMode') selectMode;

  public myDatePickerOptions: IMyDpOptions = {
      dateFormat: 'dd/mm/yyyy',
   };

  private placeholder: string = " วัน/เดือน/ปี";

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.requestGroups();
    this.http.get<any[]>(`/api/students/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
      this.student = data;
    }, (err) => {
      this.router.navigate(['/home']);
    });
  }

  requestGroups() {
    this.http.get<any[]>(`/api/groups?token=${this.authService.getToken()}`).subscribe((data) => {
      this.groups = data;
      if (this.groups.length == 0) {
        this.group = null;
        this.books = [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  requestCourses(id) {
    this.http.get<any[]>(`/api/groups/${id}/courses?token=${this.authService.getToken()}`).subscribe((data) => {
      this.courses = data;
      if (this.courses.length == 0) {
        this.course = null;
        this.books = [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  requestBooks(id) {
    this.http.get<any[]>(`/api/courses/${id}/books?token=${this.authService.getToken()}`).subscribe((data) => {
      this.books = data;
    }, (err) => {
      console.log(err);
    });
  }

  getCourse(id) {
    var results = this.courses.filter((o) => { return  o._id == id});
    return results? results[0]: null;
  }

  onAddCourse(form: NgForm) {
    const date = this.date;
    const code = form.value.code;
    const id = this.route.snapshot.params['id'];
    const branch = this.authService.getBranch();
    const books = this.selectedBooks;
    const group = this.group;
    const course = this.course;
    var body:any = {
      type: this.type, code, date, branch, books, group, course
    };
    this.http.post<any>(`/api/students/${id}/courses?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.http.get<any[]>(`/api/students/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
        this.student = data;
        this.success = null;
        this.date = null;
        this.type = null;
        this.group = 0;
        this.course = 0;
        this.selectMode.nativeElement.value = "";
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }

  // parseDate(date) {
  //   var splittedDate = date.split("-");
  //   this.date = new Date(Number(splittedDate[0]), Number(splittedDate[1])-1, Number(splittedDate[2]),
  //   0, 0, 0, 0);
  // }

  updateForm(e) {
    this.type = e.srcElement.value;
  }

  getDate(date) {
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

  onDateChanged(e) {
    this.date = e.formatted;
  }

  onSelectGroup() {
    this.selectedBooks = [];
    this.courses = [];
    this.course = 0;
    if (this.group != 0) {
      this.requestCourses(this.group);
    }
  }

  onSelectCourse() {
    this.selectedBooks = [];
    this.books = [];
    if (this.course != 0) {
      this.requestBooks(this.course);
    }
  }

  onSelectBooks(e) {
    if (e.srcElement.checked) {
      this.selectedBooks.push(e.srcElement.value);
    } else {
      this.selectedBooks = this.selectedBooks.filter((o) => { return o !== e.srcElement.value });
    }
  }

  validate(type, str) {
    if (type == 1 || type == 2) {
      var validator = /0\d{9}/;
    } else {
      var validator = /^\d{10}$/;
    }
    return validator.test(str);
  }
}
