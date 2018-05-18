import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { IMyDpOptions} from 'mydatepicker';

@Component({
    selector: 'order-search',
    templateUrl: './order-search.component.html',
    styleUrls: ['./order-search.component.css']
})
export class OrderSearchComponent implements OnInit {
  loading = false;
  errorMessage3 = null;
  searchSlipResults = [];
  date = null;

  public myDatePickerOptions: IMyDpOptions = {
      dateFormat: 'dd/mm/yyyy',
   };

  public placeholder: string = " วัน/เดือน/ปี";

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {}

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

  onDateChanged(e) {
    this.date = e.formatted;
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
}
