import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = 'https://localhost:7130/api';

  constructor(private http: HttpClient) {}

  placeBid(lotId: number, amount: number): Observable<void> {
    const bidData = { lotId, amount };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return this.http.post<void>(`${this.apiUrl}/Bids/${lotId}`, bidData, { headers });
  }
}
