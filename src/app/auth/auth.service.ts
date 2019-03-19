import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private userToken;
  private userAuthStatusListener = new Subject<boolean>();
  private tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.userToken;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getUserAuthListener() {
    return this.userAuthStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authUser: AuthData = {
      email: email,
      password: password
    };
    this.http
      .post('http://localhost:3000/api/user/signup', authUser)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const authUser: AuthData = {
      email: email,
      password: password
    };
    this.http
      .post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authUser)
      .subscribe(response => {
        const token = response.token;
        this.userToken = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userAuthStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + (expiresInDuration * 1000));
          this.saveAuthData(token, expirationDate);
          this.router.navigate(['/']);
        }
      });
  }

  autoAuthUser() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }
    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.userToken = authData.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.userAuthStatusListener.next(true);
    }
  }

  logout() {
    this.userToken = null;
    this.isAuthenticated = false;
    this.userAuthStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationTime: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationTime.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    };
  }
}
