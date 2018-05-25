import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'setting-book',
    templateUrl: './setting-book.component.html',
    styleUrls: ['./setting-book.component.css']
})
export class SettingBookComponent implements OnInit {
  books = [];
  title = null;
  addBook = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, public authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isSetting()) {
      return this.router.navigate(['/home']);
    }
    this.requestBooks();
  }

  requestBooks() {
    this.http.get<any[]>(`/api/settings/books?token=${this.authService.getToken()}`).subscribe((data) => {
      this.books = data;
    }, (err) => {
      console.log(err);
    });
  }

  onAddBook(form: NgForm) {
    var body = {title: form.value.title};
    this.http.post<any>(`/api/settings/books?token=${this.authService.getToken()}`, body).subscribe((data) => {
      this.requestBooks();
      this.addBook = false;
    });
  }
}
