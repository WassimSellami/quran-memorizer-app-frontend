import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GptService {

  constructor(private http: HttpClient) { }

  generatePreviewPlan(userInput: any): Observable<string> {
    const body = {
      userInput: JSON.stringify(userInput)
    }
    return this.http
      .post<{ response: any }>('http://localhost:3000/api/gpt/plan/preview', body)
      .pipe(
        map(response => response.response)
      );
  }
  generateFullPlan(userInput: any): Observable<string> {
    const body = {
      userInput: JSON.stringify(userInput)
    }
    return this.http
      .post<{ response: any }>('http://localhost:3000/api/gpt/plan/full', body)
      .pipe(
        map(response => response.response)
      );
  }
}
