import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lot, LotImage } from '../models/lot.model';
import { Category } from '../models/category.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class LotService {
  private apiUrl = 'https://localhost:7130/api';

  constructor(private http: HttpClient) {}

  getLots(pageNumber: number = 1, pageSize: number = 10, categoryId?: number, searchTerm?: string): Observable<PagedResult<Lot>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }
    
    return this.http.get<PagedResult<Lot>>(`${this.apiUrl}/lots`, { params });
  }

  // Для обратной совместимости - получить все лоты как массив
  getLotsArray(): Observable<Lot[]> {
    return this.http.get<Lot[]>(`${this.apiUrl}/lots`);
  }

  getLotById(id: number): Observable<Lot> {
    return this.http.get<Lot>(`${this.apiUrl}/lots/${id}`);
  }

  setMainImage(lotId: number, imageId: number): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post<void>(`${this.apiUrl}/LotImages/${lotId}/set-main/${imageId}`, null, { headers });
  }

  createLot(lot: Lot): Observable<Lot> {
    return this.http.post<Lot>(`${this.apiUrl}/lots`, lot);
  }

  updateLot(lot: Lot): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.put<void>(`${this.apiUrl}/lots`, lot, { headers });
  }

  deleteLot(id: number): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.delete<void>(`${this.apiUrl}/lots/${id}`, { headers });
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

  // Методы для работы с изображениями лотов
  uploadLotImage(lotId: number, file: File, isMain: boolean = false): Observable<{imageUrl: string, message: string}> {
    const formData = new FormData();
    formData.append('imageFile', file);
    formData.append('isMain', isMain.toString());

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return this.http.post<{imageUrl: string, message: string}>(`${this.apiUrl}/lotimages/${lotId}`, formData, { headers });
  }

  uploadLotImages(lotId: number, files: File[], isMain: boolean = false): Observable<{imageUrls: string[], message: string}> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('imageFiles', file);
    });
    formData.append('isMain', isMain.toString());

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return this.http.post<{imageUrls: string[], message: string}>(`${this.apiUrl}/lotimages/${lotId}/bulk`, formData, { headers });
  }

  deleteLotImage(imageId: number): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return this.http.delete<void>(`${this.apiUrl}/lotimages/${imageId}`, { headers });
  }
}
