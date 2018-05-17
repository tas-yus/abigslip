import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable, EventEmitter } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {
  errDetected = new EventEmitter<any>();

  constructor(private http: HttpClient, private router:Router) {}

  loginUser(username: String, password: String) {

  }

  logoutUser() {
    localStorage.clear();
  }

  isAuthenticated() {
    let jwtHelper: JwtHelper = new JwtHelper();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || jwtHelper.isTokenExpired(token)) {
      return false;
    }
    if (jwtHelper.decodeToken(token).user._id !== userId) {
      return false;
    }
    return true;
  }

  isAdmin() {
    let jwtHelper: JwtHelper = new JwtHelper();
    const token = localStorage.getItem('token');
    const decoded = jwtHelper.decodeToken(token);
    return decoded.user.isAdmin;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getBranch() {
    let jwtHelper: JwtHelper = new JwtHelper();
    const token = localStorage.getItem('token');
    return jwtHelper.decodeToken(token).user.branch;
  }

  getUsername() {
    let jwtHelper: JwtHelper = new JwtHelper();
    const token = localStorage.getItem('token');
    return jwtHelper.decodeToken(token).user.username;
  }

  getBranchString() {
    const branchArray: any = [
      "Admin",
      "BG", "BW", "BB",
      "BC", "BS", "BP",
      "BNG", "BR", "BH",
      "BU", "BPK", "BN",
      "BA", "BQ"
    ];
    let jwtHelper: JwtHelper = new JwtHelper();
    const token = localStorage.getItem('token');
    return branchArray[jwtHelper.decodeToken(token).user.branch];
  }
}
