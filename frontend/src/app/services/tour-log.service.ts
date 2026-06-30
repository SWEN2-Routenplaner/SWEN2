import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TourLog } from '../models/tour-log.model';
import { TourLogCreateRequest, TourLogUpdateRequest } from '../models/tour-log.dto';

@Injectable({ providedIn: 'root' })
export class TourLogService {
  private readonly http = inject(HttpClient);
  private readonly toursBaseUrl = 'http://localhost:8080/api/tours';
  private readonly logsBaseUrl = 'http://localhost:8080/api/logs';

  getLogs(tourId: number): Observable<TourLog[]> {
    return this.http.get<TourLog[]>(`${this.toursBaseUrl}/${tourId}/logs`, { withCredentials: true });
  }

  getLogById(logId: number): Observable<TourLog> {
    return this.http.get<TourLog>(`${this.logsBaseUrl}/${logId}`, { withCredentials: true });
  }

  createLog(tourId: number, body: TourLogCreateRequest): Observable<TourLog> {
    return this.http.post<TourLog>(`${this.toursBaseUrl}/${tourId}/logs`, body, { withCredentials: true });
  }

  updateLog(logId: number, body: TourLogUpdateRequest): Observable<TourLog> {
    return this.http.put<TourLog>(`${this.logsBaseUrl}/${logId}`, body, { withCredentials: true });
  }

  deleteLog(logId: number): Observable<void> {
    return this.http.delete<void>(`${this.logsBaseUrl}/${logId}`, { withCredentials: true });
  }
}
