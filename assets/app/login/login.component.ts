import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit {
  errMessage: String;
  successMessage: String;
  disabled = false;

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  onLoginUser(form: NgForm) {
    const username = form.value.username;
    const password = form.value.password;
    this.disabled = true;
    this.http.post<any>('/login', {username, password}).subscribe((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      if(this.authService.isSetting()) {
        this.router.navigate(['/settings']);
      } else {
        this.router.navigate(['/home']);
      }
    }, (err) => {
      this.disabled = false;
      this.errMessage = err.error.message;
      setTimeout(() => {
        this.errMessage = null;
      }, 3000);
    });
  }
}
