import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TourLog } from '../models/tour-log.model';
import { TourLogCreateRequest, TourLogUpdateRequest } from '../models/tour-log.dto';

@Injectable({ providedIn: 'root' })
export class TourLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/tours';

  getLogs(tourId: number): Observable<TourLog[]> {
    return this.http.get<TourLog[]>(`${this.baseUrl}/${tourId}/logs`);
  }

  getLogById(tourId: number, logId: number): Observable<TourLog> {
    return this.http.get<TourLog>(`${this.baseUrl}/${tourId}/logs/${logId}`);
  }

  createLog(tourId: number, body: TourLogCreateRequest): Observable<TourLog> {
    return this.http.post<TourLog>(`${this.baseUrl}/${tourId}/logs`, body);
  }

  updateLog(tourId: number, logId: number, body: TourLogUpdateRequest): Observable<TourLog> {
    return this.http.put<TourLog>(`${this.baseUrl}/${tourId}/logs/${logId}`, body);
  }

  deleteLog(tourId: number, logId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tourId}/logs/${logId}`);
  }
}
