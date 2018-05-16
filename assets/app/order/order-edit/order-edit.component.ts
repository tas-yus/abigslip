import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  errMessage = null;
  successMessage = null;
  canEdit = true;
  types = ['KTB', 'GSB', 'CS'];

  @ViewChild('selectMode') selectMode;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.requestOrder(id);
  }

  requestOrder(id) {
    this.http.get<any>(`/api/orders/${id}`).subscribe((data) => {
      if (data.claimed || data.createdByServer) {
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
      this.getDate(data.date);
    }, (err) => {
      console.log(err);
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
    this.dateString = `${parsedDate[2]}-${parsedDate[0]}-${parsedDate[1]}`;
  }

  parseDate(date) {
    var splittedDate = date.split("-");
    this.date = new Date(Number(splittedDate[0]), Number(splittedDate[1])-1, Number(splittedDate[2]),
    0, 0, 0, 0);
  }

  onEditOrder(form: NgForm) {
    this.parseDate(this.dateString);
    this.ngOrder.date = this.date;
    this.ngOrder.type = this.type;
    this.http.post<any>('/api/orders/verify', this.ngOrder)
    .subscribe((data) => {
      this.successMessage = data.message;
      this.router.navigate([`/orders/${data.id}/edit`]);
      this.requestOrder(data.id);
      this.canEdit = false;
    }, (err) => {
      console.log(err);
    });
  }
}
