import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'student-add',
    templateUrl: './student-add.component.html',
    styleUrls: ['./student-add.component.css']
})
export class StudentAddComponent implements OnInit {
  firstname = null;
  lastname = null;
  date = null;
  type = 1;
  success = null;
  file = null;
  output = null;
  loading = false;
  errorMessage1 = null;
  errorMessage2 = null;
  errorMessage3 = null;
  errorMessage4 = null;
  errorMessage5 = null;
  successMessage = null;
  searchResults = [];
  searchSlipResults = [];
  @ViewChild('fileUpload') fileUpload;

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {}

  onAddStudent(form: NgForm) {
    const firstname = form.value.firstname;
    const lastname = form.value.lastname;
    var body:any = {
      firstname, lastname
    };
    this.http.post<any>(`/api/students?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.router.navigate([`/students/${data.id}`]);
    }, (err) => {
      this.errorMessage1 = err.error.message;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }

  // parseDate(date, time) {
  //   var splittedDate = date.split("-");
  //   var splittedTime = time.split(":");
  //   this.date = new Date(Number(splittedDate[0]), Number(splittedDate[1])-1, Number(splittedDate[2]),
  //   Number(splittedTime[0]), Number(splittedTime[1]), Number(splittedTime[2]), 0);
  // }

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

  searchSlip(code, date) {
    var query = '';
    if (code && date) {
      query += `&&code=${code}&&date=${date}`;
    } else if (code && !date) {
      query += `&&code=${code}`;
    } else if (!code && date) {
      query += `&&date=${date}`;
    } else {
      console.log("error");
    }
    this.http.get<any[]>(`/api/orders/search?token=${this.authService.getToken()}` + query).subscribe((data) => {
      this.searchSlipResults = data;
    }, (err) => {
      this.searchSlipResults = [];
      this.errorMessage3 = err.error.message;
      setTimeout(() => {
        this.errorMessage3 = null;
      }, 3000);
    });
  }

  onUpload() {
    const formData: any = new FormData();
    formData.append("file", this.file);
    this.loading = true;
    this.http.post<any>(`/api/slips/upload?token=${this.authService.getToken()}`, formData).subscribe((data) =>{
      this.http.post<any>(`/api/orders/parse?token=${this.authService.getToken()}`, {filename: data.filename}).subscribe((data) => {
        this.loading = false;
        this.successMessage = `อัพเดทฐานข้อมูลสำเร็จ! // เพิ่ม slip ${data.countAdded} รายการ // match ${data.countMatched} รายการ`
        this.onReset();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000)
      }, (err) => {
        this.loading = false;
        this.onReset();
        this.errorMessage4 = err.error.message;
        setTimeout(() => {
          this.errorMessage4 = null;
        }, 3000);
     });
    }, (err) => {
      this.loading = false;
      this.onReset();
      this.errorMessage4 = err.error.message;
      setTimeout(() => {
        this.errorMessage4 = null;
      }, 3000);
    });
  }

  updateFile(event) {
    this.file = event.srcElement.files[0];
  }

  onReset() {
    this.file = null;
    this.fileUpload.nativeElement.value = "";
  }

  onCreateExcel(form: NgForm) {
    const from = form.value.from;
    const to = form.value.to;
    const type = this.type;
    this.http.post<any>(`/api/excel?token=${this.authService.getToken()}`, {from, to, type}).subscribe((data) => {
      this.type = 1;
      this.output = data.filename;
      form.reset();
    }, (err) => {
      this.errorMessage5 = err.error.message;
      setTimeout(() => {
        this.errorMessage5 = null;
      }, 3000);
    });
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
    return `${parsedDate[2]}-${parsedDate[0]}-${parsedDate[1]}`;
  }

  updateForm(e) {
    this.type = e.srcElement.value;
  }
}
