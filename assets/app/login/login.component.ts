import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

// import { AuthService } from '../auth.service';
// import { UserService } from '../../dashboard/user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  // providers: [AuthService]
})

export class LoginComponent implements OnInit {
  errMessage: String;
  successMessage: String;

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  onLoginUser(form: NgForm) {
    const username = form.value.username;
    const password = form.value.password;
    this.http.post<any>('/login', {username, password}).subscribe((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      this.router.navigate(['/home']);
    }, (err) => {
      console.log(err);
    })
  }

  onResend() {
    // this.userService.resendUserActivationLink(this.username, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //     this.errMessage = "The server cannot process your request. Please contact us to get your account activated";
    //   } else {
    //     this.errMessage = null;
    //     this.successMessage = "Activation link resent. Please check your email!";
    //   }
    // })
  }
}
