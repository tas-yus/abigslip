import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { IMyDpOptions} from 'mydatepicker';

declare var $:any;

@Component({
    selector: 'order-edit',
    templateUrl: './order-edit.component.html',
    styleUrls: ['./order-edit.component.css']
})
export class OrderEditComponent implements OnInit {
  order = null;
  ngOrder = null;
  type = null;
  dateString = null;
  date = null;
  public model = null;
  errMessage = null;
  successMessage = null;
  canEdit = true;
  errorMessage1 = null;
  errorMessage2 = null;
  loading = false;
  course = 0;
  courses = [];
  books = [];
  groups = [];
  selectedBooks = [];
  group = null;
  types = ['KTB', 'GSB', 'CS', 'KTC', 'FREE'];
  branchArray: any = [
    "Admin",
    "BG", "BW", "BB",
    "BC", "BS", "BP",
    "BNG", "BR", "BH",
    "BU", "BPK", "BN",
    "BA", "BQ"
  ];
  showEdit2 = false;

  @ViewChild('selectMode') selectMode;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.requestOrder(id);
  }

  public myDatePickerOptions: IMyDpOptions = {
      dateFormat: 'dd/mm/yyyy',
   };

  requestOrder(id) {
    this.http.get<any>(`/api/orders/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
      this.requestGroups();
      this.group = data.group;
      if (data.claimed && data.type != 5 || data.createdByServer || data.void) {
        this.canEdit = false;
      }
      this.order = data;
      this.ngOrder = {
        code: data.code,
        courseCode: data.courseCode,
        price: data.price,
        claimed: data.claimed,
        type: data.type,
        oldId: data._id,
        studentId: data.claimedBy
      };
      this.type = data.type;
      var date = new Date(data.date);
      this.model = { date: { year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate() }, formatted: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}` }
    }, (err) => {
      this.router.navigate(['/home']);
    });
  }

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

  onEditOrder(form: NgForm) {
    this.ngOrder.date = this.model.formatted;
    this.ngOrder.type = this.type;
    this.ngOrder.group = this.group;
    const id = this.route.snapshot.params['id'];
    this.http.post<any>(`/api/orders/${id}/verify?token=${this.authService.getToken()}`, this.ngOrder)
    .subscribe((data) => {
      this.successMessage = data.message;
      this.router.navigate([`/orders/${data.id}/edit`]);
      this.requestOrder(data.id);
      if (this.order.claimed) {
        this.canEdit = false;
      } 
    }, (err) => {
      this.errorMessage1 = err.error.message;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }

  onVoidOrder() {
    const id = this.route.snapshot.params['id'];
    this.http.put<any>(`/api/orders/${id}/void?token=${this.authService.getToken()}`, {void: true}).subscribe((data) => {
      this.requestOrder(id);
      $('#exampleModal').modal('hide');
    }, (err) => {
      this.router.navigate(['/home']);
    });
  }

  claim(type, createdByServer) {
    if (type != 4 || createdByServer) return;
    const id = this.route.snapshot.params['id'];
    this.http.put<any>(`/api/orders/${id}/claim?token=${this.authService.getToken()}`, {}).subscribe((data) => {
      this.requestOrder(id);
    }, (err) => {
      this.errorMessage2 = err.error.message;
      setTimeout(() => {
        this.errorMessage2 = null;
      }, 3000);
    });
  }

  getCourse(id) {
    var results = this.courses.filter((o) => { return  o._id == id});
    return results? results[0]: null;
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

  requestBooks(id) {
    this.http.get<any[]>(`/api/courses/${id}/books?token=${this.authService.getToken()}`).subscribe((data) => {
      this.books = data;
      if (this.books.length == this.getCourse(id).numBook && this.getCourse(id).strict) {
        this.selectedBooks = this.books;
      }
    }, (err) => {
      console.log(err);
    });
  }

  requestCourses(courseCode) {
    this.http.get<any[]>(`/api/courseCode/${courseCode}/courses?token=${this.authService.getToken()}`).subscribe((data) => {
      this.courses = data;
      if (this.courses.length == 0) {
        this.course = null;
        this.books = [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  check(book) {
    var books = this.selectedBooks.filter((o) => { return o._id == book });
    return !!books[0];
  }

  canAdd() {
    if (this.course == 0) return false;
    if (this.getCourse(this.course).strict && this.selectedBooks.length !== this.getCourse(this.course).numBook) return false;
    if (this.selectedBooks.length > this.getCourse(this.course).numBook) return false;
    return true;
  }

  onEditBook() {
    const id = this.route.snapshot.params['id'];
    var books = this.selectedBooks;
    var course = this.course;
    var body = {
      books, course
    };
    this.http.put<any>(`/api/orders/${id}/books?token=${this.authService.getToken()}`, body)
    .subscribe((data) => {
      this.requestOrder(id);
      this.showEdit2 = false;
    }, (err) => {
      this.errorMessage1 = err.error.message;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }

  requestGroups() {
    this.http.get<any[]>(`/api/groups?token=${this.authService.getToken()}`).subscribe((data) => {
      this.groups = data;
      if (this.groups.length == 0) {
        this.group = null;
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
      }
    }, (err) => {
      console.log(err);
    });
  }
  // onDelete() {
  //   const id = this.route.snapshot.params['id'];
  //   this.http.delete<any>(`/api/orders/${id}?token=${this.authService.getToken()}`).subscribe(data => {
  //     console.log("deleted");
  //   });
  // }
}
