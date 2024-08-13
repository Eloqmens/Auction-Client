import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lot } from '../models/lot.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class LotService {
  private apiUrl = 'https://localhost:7130/api';

  constructor(private http: HttpClient) {}

  getLots(): Observable<Lot[]> {
    return this.http.get<Lot[]>(`${this.apiUrl}/lots`);
  }

  getLotById(id: number): Observable<Lot> {
    return this.http.get<Lot>(`${this.apiUrl}/lots/${id}`);
  }

  createLot(lot: Lot): Observable<Lot> {
    return this.http.post<Lot>(`${this.apiUrl}/lots`, lot);
  }

  updateLot(lot: Lot): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/lots`, lot);
  }

  deleteLot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lots/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }
}
