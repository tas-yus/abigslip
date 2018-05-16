import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  errorMessage = null;
  errorMessage1 = null;
  successMessage = null;
  searchResults = null;
  searchSlipResults = null;
  @ViewChild('fileUpload') fileUpload;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {}

  // onVerifyStudent(form: NgForm) {
  //   // const firstname = form.value.firstname;
  //   // const lastname = form.value.lastname;
  //   const date = form.value.date;
  //   const time = form.value.time;
  //   const code = form.value.code;
  //   this.parseDate(date, time);
  //   var body:any = {
  //     type: this.type, code, date: this.date
  //   };
  //   this.http.post<any>('/api/orders/verify', body).subscribe((data) => {
  //     this.success = true;
  //   }, (err) => {
  //     this.success = false;
  //     setTimeout(() => {
  //       this.success = null;
  //     }, 2000);
  //   });
  // }

  onAddStudent(form: NgForm) {
    const firstname = form.value.firstname;
    const lastname = form.value.lastname;
    var body:any = {
      firstname, lastname
    };
    this.http.post<any>('/api/students', body).subscribe((data) => {
      this.router.navigate([`/students/${data.id}`]);
    }, (err) => {
      console.log(err);
    });
  }

  parseDate(date, time) {
    var splittedDate = date.split("-");
    var splittedTime = time.split(":");
    this.date = new Date(Number(splittedDate[0]), Number(splittedDate[1])-1, Number(splittedDate[2]),
    Number(splittedTime[0]), Number(splittedTime[1]), Number(splittedTime[2]), 0);
  }

  search(value) {
    var query = value === ''? '' : `?name=${value}`;
    if (value) {
      this.http.get<any[]>('/api/students/search' + query).subscribe((data) => {
        this.searchResults = data;
      }, (err) => {
        console.log(err);
      });
    }
  }

  onUpload() {
    const formData: any = new FormData();
    formData.append("file", this.file);
    this.http.post<any>('/api/slips/upload', formData).subscribe((data) =>{
      this.http.post('/api/orders/parse', {filename: data.filename}).subscribe((data) => {
        this.successMessage = "อัพเดทฐานข้อมูลสำเร็จ!"
        this.onReset();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000)
      }, (err) => {
        console.log(err.error.message);
      });
    }, (err) => {
      this.errorMessage = err.error.message;
      setTimeout(() => {
        this.errorMessage = null;
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
    this.http.post<any>('/api/excel', {from, to, type}).subscribe((data) => {
      console.log(data);
      this.type = 1;
      this.output = data.filename;
      form.reset();
    }, (err) => {
      console.log(err);
    });
  }

  searchSlip(code, date) {
    var query = '?';
    if (code && date) {
      query += `code=${code}&&date=${date}`;
    } else if (code && !date) {
      query += `code=${code}`;
    } else if (!code && date) {
      query += `date=${date}`;
    } else {
      console.log("error");
    }
    this.http.get<any[]>('/api/orders/search' + query).subscribe((data) => {
      this.searchSlipResults = data;
    }, (err) => {
      this.searchSlipResults = [];
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
