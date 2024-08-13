import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = 'https://localhost:7130/api'; // URL к вашему API

  constructor(private http: HttpClient) {}

  placeBid(lotId: number, amount: number): Observable<void> {
    const bidData = { lotId, amount };
    return this.http.post<void>(`${this.apiUrl}/bids/${lotId}`, bidData);
  }
}
