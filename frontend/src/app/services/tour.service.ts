import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Tour } from '../models/tour.model';
import { TourCreateRequest, TourUpdateRequest } from '../models/tour.dto';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/tours';

  // optional query parameter for searching tours
  getTours(query?: string): Observable<Tour[]> {
    const params = query ? new HttpParams().set('query', query) : undefined;
    return this.http.get<Tour[]>(this.baseUrl, { params, withCredentials: true });
  }

  getTourById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  createTour(body: TourCreateRequest): Observable<Tour> {
    return this.http.post<Tour>(this.baseUrl, body, { withCredentials: true });
  }

  updateTour(id: number, body: TourUpdateRequest): Observable<Tour> {
    return this.http.put<Tour>(`${this.baseUrl}/${id}`, body, { withCredentials: true });
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
