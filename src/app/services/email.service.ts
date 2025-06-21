import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  readonly API_URL = 'https://quran-memorizer-app-backend.onrender.com/api/email';
  // readonly API_URL = 'http://localhost:3000/api/email';

  constructor(private http: HttpClient) { }

  subscribeToEmailReminder(email: string, csv: string): Observable<string> {
    const body = {
      email,
      csv
    }
    return this.http
      .post<{ response: any }>(`${this.API_URL}/subscribe`, body)
      .pipe(
        map(response => response.response)
      );
  }

  unsubscribeFromEmailReminder(email: string): Observable<string> {
    const body = {
      email
    }
    return this.http
      .post<{ response: any }>(`${this.API_URL}/unsubscribe`, body)
      .pipe(
        map(response => response.response)
      );
  }
}
