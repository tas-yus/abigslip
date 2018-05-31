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
  price = null;
  types = ['KTB', 'GSB', 'CS', 'KTC', 'FREE'];
  model = null;
  groups = [];
  courses = [];
  books = [];
  group =  0;
  course = 0;
  selectedBooks = [];
  loading = false;
  free = false;
  errMessage = null;
  successMessage = null;
  @ViewChild('selectMode') selectMode;

  public myDatePickerOptions: IMyDpOptions = {
      dateFormat: 'dd/mm/yyyy',
   };

  private placeholder: string = " วัน/เดือน/ปี";

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
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

  requestFreeGroups() {
    this.http.get<any[]>(`/api/groups/free?token=${this.authService.getToken()}`).subscribe((data) => {
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

  getGroup(id) {
    var results = this.groups.filter((o) => { return  o._id == id});
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
    this.loading = true;
    this.http.post<any>(`/api/students/${id}/courses?token=${this.authService.getToken()}`, body).subscribe((data) => {
      var orderId = data.orderId;
      this.http.get<any[]>(`/api/students/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
        this.loading = false;
        this.student = data;
        this.date = null;
        this.type = null;
        this.group = 0;
        this.course = 0;
        this.selectMode.nativeElement.value = "";
        this.successMessage = "เพิ่มรายการโอนสำเร็จ โปรดตรวจเช็ค";
        setTimeout(() => {
          document.querySelector('#o' + orderId).scrollIntoView();
        });
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      }, (err) => {
        this.loading = false;
        this.router.navigate(['/home']);
      });
    }, (err) => {
      this.loading = false;
      // this.date = null;
      // this.type = null;
      // this.group = 0;
      // this.course = 0;
      // this.selectMode.nativeElement.value = "";
      this.errMessage = err.error.message;
      setTimeout(() => {
        this.errMessage = null;
      }, 3000);
    });
  }

  // parseDate(date) {
  //   var splittedDate = date.split("-");
  //   this.date = new Date(Number(splittedDate[0]), Number(splittedDate[1])-1, Number(splittedDate[2]),
  //   0, 0, 0, 0);
  // }

  updateForm(e) {
    this.type = e.srcElement.value;
    if (this.type != 5) {
      if (this.free) {
        this.courses = [];
        this.course = 0;
        this.group = 0;
        this.selectedBooks = [];
        this.books = [];
        this.free = false;
      }
      this.requestGroups();
    } else {
      this.free = true;
      this.requestFreeGroups();
    }
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
    if (type == 5 || type == 4) return true;
    if (type == 1 || type == 2) {
      var validator = /0\d{9}/;
    } else if (type == 3){
      var validator = /^\d{10}$/;
    }
    return validator.test(str);
  }

  canAdd() {
    if (this.type < 1 || this.type > 5) return false;
    if (!this.date) return false;
    if (this.group == 0) return false;
    if (this.getGroup(this.group).courses && this.getGroup(this.group).courses.length !== 0) {
      if (this.course == 0) return false;
      if (this.getCourse(this.course).strict && this.selectedBooks.length !== this.getCourse(this.course).numBook) return false;
      if (this.selectedBooks.length > this.getCourse(this.course).numBook) return false;
    } else {
      return true;
    }
    return true;
  }
}
