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
  types = ['KTB', 'GSB', 'CS'];
  model = null;
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

  onAddCourse(form: NgForm) {
    const date = this.date;
    const time = form.value.time;
    const code = form.value.code;
    const courseCode = form.value.courseCode;
    const id = this.route.snapshot.params['id'];
    const price = form.value.price;
    const branch = this.authService.getBranch();
    var body:any = {
      type: this.type, code, date, courseCode, price, branch
    };
    this.http.post<any>(`/api/students/${id}/courses?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.http.get<any[]>(`/api/students/${id}?token=${this.authService.getToken()}`).subscribe((data) => {
        this.student = data;
        this.success = null;
        this.date = null;
        this.type = null;
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
}
