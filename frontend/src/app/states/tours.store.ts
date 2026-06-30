import { Injectable, signal, inject } from '@angular/core';
import { Tour } from '../models/tour.model';
import { TourCreateRequest, TourUpdateRequest } from '../models/tour.dto';
import { TourService } from '../services/tour.service';
import {Observable, shareReplay, tap} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToursStore {
  private readonly tourService = inject(TourService);

  private tours = signal<Tour[]>([]);
  readonly allTours = this.tours.asReadonly();

  // to display loading status in the UI
  private loading = signal<boolean>(false);
  readonly isLoading = this.loading.asReadonly();

  // to display error messages in the UI
  private errorState = signal<string | null>(null);
  readonly error = this.errorState.asReadonly();

  constructor() {
    this.loadTours();
  }

  loadTours(): void {
    this.loading.set(true);
    this.errorState.set(null);

    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours.set(tours);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorState.set('Failed to load tours');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  getTourById(id: number): Tour | undefined {
    // first fetch from backend and update local state
   this.loading.set(true);
   this.errorState.set(null);
   this.tourService.getTourById(id).subscribe({
      next: (tour) => {
        this.tours.update(tours => {
          const exists = tours.some(t => t.id === tour.id);
          return exists ? tours.map(t => t.id === tour.id ? tour : t) : [...tours, tour];
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorState.set('Failed to load tour');
        this.loading.set(false);
        console.error(err);
      }
   })
    // then return from up-to-date local state
    return this.tours().find(tour => tour.id === id);
  }

  addTour(body: TourCreateRequest): Observable<Tour> {
    this.loading.set(true);
    this.errorState.set(null);

    const request$ = this.tourService.createTour(body).pipe(
      tap({
        next: (tour) => {
          this.tours.update(tours => [...tours, tour]);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorState.set('Failed to create tour');
          this.loading.set(false);
          console.error(err);
        }
      }),
      shareReplay(1)
    );

    request$.subscribe(); // ensures the store updates even if caller doesn't subscribe
    return request$;
  }

  updateTour(id: number, body: TourUpdateRequest): Observable<Tour> {
    this.loading.set(true);
    this.errorState.set(null);

    const request$ = this.tourService.updateTour(id, body).pipe(
      tap({
        next: (updated) => {
          this.tours.update(tours => tours.map(t => t.id === updated.id ? updated : t));
          this.loading.set(false);
        },
        error: (err) => {
          this.errorState.set('Failed to update tour');
          this.loading.set(false);
          console.error(err);
        }
      }),
      shareReplay(1)
    );

    request$.subscribe();
    return request$;
  }

  deleteTour(id: number): Observable<void> {
    this.loading.set(true);
    this.errorState.set(null);

    const request$ = this.tourService.deleteTour(id).pipe(
      tap({
        next: () => {
          this.tours.update(tours => tours.filter(tour => tour.id !== id));
          this.loading.set(false);
        },
        error: (err) => {
          this.errorState.set('Failed to delete tour');
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
