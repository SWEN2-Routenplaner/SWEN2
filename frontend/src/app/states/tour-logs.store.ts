// tour-logs.store.ts
import { Injectable, signal, inject } from '@angular/core';
import { Observable, tap, shareReplay } from 'rxjs';
import { TourLog } from '../models/tour-log.model';
import { TourLogCreateRequest, TourLogUpdateRequest } from '../models/tour-log.dto';
import { TourLogService } from '../services/tour-log.service';

@Injectable({ providedIn: 'root' })
export class TourLogsStore {
  private readonly tourLogService = inject(TourLogService);

  private tourLogs = signal<TourLog[]>([]);

  // to display loading status in the UI
  private loading = signal<boolean>(false);
  readonly isLoading = this.loading.asReadonly();

  // to display error messages in the UI
  private errorState = signal<string | null>(null);
  readonly error = this.errorState.asReadonly();

  loadLogs(tourId: number): void {
    this.loading.set(true);
    this.errorState.set(null);

    this.tourLogService.getLogs(tourId).subscribe({
      next: (logs) => {
        // replace only this tour's logs, keep other tours' logs already in the cache
        this.tourLogs.update(existing => [
          ...existing.filter(log => log.tourId !== tourId),
          ...logs
        ]);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorState.set('Failed to load tour logs');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  getLogsByTourId(tourId: number): TourLog[] {
    return this.tourLogs().filter(log => log.tourId === tourId);
  }

  getTourLogById(logId: number): TourLog | undefined {
    // first fetch from backend and update local state
    this.loading.set(true);
    this.errorState.set(null);
    this.tourLogService.getLogById(logId).subscribe({
      next: (log) => {
        this.tourLogs.update(logs => {
          const exists = logs.some(l => l.id === log.id);
          return exists ? logs.map(l => l.id === log.id ? log : l) : [...logs, log];
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorState.set('Failed to load tour log');
        this.loading.set(false);
        console.error(err);

      }
    });
    // then return from up-to-date local state
    return this.tourLogs().find(log => log.id === logId);
  }

  addTourLog(tourId: number, body: TourLogCreateRequest): Observable<TourLog> {
    this.loading.set(true);
    this.errorState.set(null);

    const request$ = this.tourLogService.createLog(tourId, body).pipe(
      tap({
        next: (log) => {
          this.tourLogs.update(logs => [...logs, log]);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorState.set('Failed to create tour log');
          this.loading.set(false);
          console.error(err);
        }
      }),
      shareReplay(1)
    );

    request$.subscribe();
    return request$;
  }

  updateTourLog(logId: number, body: TourLogUpdateRequest): Observable<TourLog> {
    this.loading.set(true);
    this.errorState.set(null);

    const request$ = this.tourLogService.updateLog(logId, body).pipe(
      tap({
        next: (updated) => {
          this.tourLogs.update(logs => logs.map(l => l.id === updated.id ? updated : l));
          this.loading.set(false);
        },
        error: (err) => {
          this.errorState.set('Failed to update tour log');
          this.loading.set(false);
          console.error(err);
        }
      }),
      shareReplay(1)
    );

    request$.subscribe();
    return request$;
  }

  deleteTourLog(logId: number): Observable<void> {
    this.loading.set(true);
    this.errorState.set(null);

    const request$ = this.tourLogService.deleteLog(logId).pipe(
      tap({
        next: () => {
          this.tourLogs.update(logs => logs.filter(log => log.id !== logId));
          this.loading.set(false);
        },
        error: (err) => {
          this.errorState.set('Failed to delete tour log');
          this.loading.set(false);
          console.error(err);
        }
      }),
      shareReplay(1)
    );

    request$.subscribe();
    return request$;
  }
}
