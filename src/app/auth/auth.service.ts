import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';

@Injectable({providedIn: 'root'})
export class AuthService {
  private userToken;

  constructor(private http: HttpClient) {}

  getToken() {
    return this.userToken;
  }

  createUser(email: string, password: string) {
    const authUser: AuthData = {
      email: email,
      password: password
    };
    this.http.post('http://localhost:3000/api/user/signup', authUser)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const authUser: AuthData = {
      email: email,
      password: password
    };
    this.http.post<{ token: string }>('http://localhost:3000/api/user/login', authUser)
      .subscribe(response => {
        this.userToken = response.token;
      });
  }

}
