import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'setting-group',
    templateUrl: './setting-group.component.html',
    styleUrls: ['./setting-group.component.css']
})
export class SettingGroupComponent implements OnInit {
  groups = [];
  showEditGroup = [];
  showEditCourse = [];
  addCourse = [];
  addGroup = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isSetting()) {
      return this.router.navigate(['/home']);
    }
    this.requestGroups();
  }

  requestGroups() {
    this.http.get<any[]>(`/api/settings/groups?token=${this.authService.getToken()}`).subscribe((data) => {
      this.groups = data;
      // this.ngGroups = JSON.parse(JSON.stringify(this.groups));
    }, (err) => {
      console.log(err);
    });
  }

  onShowEditGroup(i) {
    var showEdit = this.showEditGroup[i];
    this.showEditGroup = [];
    this.showEditGroup[i] = !showEdit;
  }

  onShowEditCourse(i) {
    var showEdit = this.showEditCourse[i];
    this.showEditCourse = [];
    this.showEditCourse[i] = !showEdit;
  }

  onAddGroup(form: NgForm) {
    var body = {code: form.value.code, price: form.value.price, title: form.value.title};
    this.http.post<any>(`/api/settings/groups?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.router.navigate([`/settings/groups/${data._id}/edit`]);
    }, (err) => {
      console.log(err);
    });
  }

  // onEditGroup(i) {
  //   this.showEditGroup = [];
  //   var id = this.ngGroups[i]._id;
  //   var body = {code: this.ngGroups[i].code, price: this.ngGroups[i].price};
  //   this.http.put<any>(`/api/settings/groups/${id}?token=${this.authService.getToken()}`, body).subscribe((data) => {
  //     this.requestGroups();
  //   }, (err) => {
  //     console.log(err);
  //   })
  // }

  // onAddCourse(i) {
  //   var addCourse = this.addCourse[i];
  //   this.addCourse = [];
  //   this.addCourse[i] = !addCourse;
  // }

}
