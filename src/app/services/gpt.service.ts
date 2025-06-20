import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GptService {
  // readonly API_URL = 'https://quran-memorizer-app-backend.onrender.com/api/gpt';
  readonly API_URL = 'http://localhost:3000/api/gpt';

  constructor(private http: HttpClient) { }

  generatePreviewPlan(userInput: any): Observable<string> {
    const body = {
      userInput: JSON.stringify(userInput)
    }
    return this.http
      .post<{ response: any }>(`${this.API_URL}/plan/preview`, body)
      .pipe(
        map(response => response.response)
      );
  }
  generateFullPlan(userInput: any): Observable<string> {
    const body = {
      userInput: JSON.stringify(userInput)
    }
    return this.http
      .post<{ response: any }>(`${this.API_URL}/plan/full`, body)
      .pipe(
        map(response => response.response)
      );
  }
}
