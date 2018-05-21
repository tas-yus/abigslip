import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { IMyDpOptions} from 'mydatepicker';

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
  loading = false;
  types = ['KTB', 'GSB', 'CS'];

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
      if (data.claimed || data.createdByServer || data.void) {
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
    const id = this.route.snapshot.params['id'];
    this.http.post<any>(`/api/orders/${id}/verify?token=${this.authService.getToken()}`, this.ngOrder)
    .subscribe((data) => {
      this.successMessage = data.message;
      this.router.navigate([`/orders/${data.id}/edit`]);
      this.requestOrder(data.id);
      this.canEdit = false;
    }, (err) => {
      this.errorMessage1 = err.error.message;
      setTimeout(() => {
        this.errorMessage1 = null;
      }, 3000);
    });
  }
}
