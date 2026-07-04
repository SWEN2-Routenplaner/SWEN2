import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ActiveTourStore } from '../../../states/active-tour-store';
import { ToursStore } from '../../../states/tours.store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
  standalone: true
})
export class Search implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private activeTourStore = inject(ActiveTourStore);
  private toursStore = inject(ToursStore);

  // OpenRouteService API Key
  private readonly ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMyZjk5MTUxNWMxNjQ3YWY4MDNlMjYzNGZkY2EzOTcxIiwiaCI6Im11cm11cjY0In0=';

  searchQuery = signal('');
  results = signal<{
    tours: any[];
    logs: any[];
    places: any[];
  }>({ tours: [], logs: [], places: [] });

  private searchSubject = new Subject<string>();
  private searchSub: Subscription | undefined;

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          return of({ tours: [], logs: [], places: [] });
        }
        const trimmed = query.trim();

        // 1. Query the backend search endpoint for database tours & logs
        const dbUrl = `http://localhost:8080/api/search?q=${encodeURIComponent(trimmed)}`;
        const dbCall = this.http.get<{ tours: any[], tourLogs: any[] }>(dbUrl, { withCredentials: true }).pipe(
          catchError(() => of({ tours: [], tourLogs: [] }))
        );

        // 2. Query the public OpenRouteService geocoder for places & POIs
        const orsUrl = `https://api.openrouteservice.org/geocode/search?api_key=${this.ORS_API_KEY}&text=${encodeURIComponent(trimmed)}&size=5`;
        const orsCall = this.http.get<any>(orsUrl).pipe(
          catchError(() => of(null))
        );

        return forkJoin([dbCall, orsCall]).pipe(
          switchMap(([dbRes, orsRes]) => {
            const places: any[] = [];
            if (orsRes && orsRes.features) {
              orsRes.features.forEach((feat: any) => {
                const props = feat.properties;
                const geom = feat.geometry;
                if (props && geom && geom.coordinates) {
                  places.push({
                    name: props.label || props.name,
                    lon: geom.coordinates[0],
                    lat: geom.coordinates[1],
                    category: props.layer || 'place'
                  });
                }
              });
            }

            return of({
              tours: dbRes.tours || [],
              logs: dbRes.tourLogs || [],
              places
            });
          })
        );
      })
    ).subscribe({
      next: (res) => {
        this.results.set(res);
      },
      error: (err) => {
        console.error('Search pipeline encountered an error', err);
      }
    });
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.searchSubject.next(val);
  }

  selectTour(tour: any): void {
    // Map Search DTO back to Tour model structure
    const mappedTour = {
      id: tour.id,
      name: tour.name,
      description: tour.description,
      from: tour.from,
      to: tour.to,
      transportType: tour.transportType,
      distance: tour.distance,
      estimatedDuration: tour.estimatedTime,
      routeInformation: tour.routeInformation
    };
    this.activeTourStore.activeTour.set(mappedTour);
    this.clearSearch();
  }

  selectLog(log: any): void {
    // Load the tour associated with the log
    const tour = this.toursStore.allTours().find(t => t.id === log.tourId);
    if (tour) {
      this.activeTourStore.activeTour.set(tour);
    }
    this.clearSearch();
  }

  selectPlace(place: any): void {
    // Set the selected Poi so the map and forms can react to it
    this.activeTourStore.selectedPoi.set(place);
    this.activeTourStore.mapViewRequest.set({ lat: place.lat, lon: place.lon });
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.results.set({ tours: [], logs: [], places: [] });
  }

  hasResults(): boolean {
    const r = this.results();
    return r.tours.length > 0 || r.logs.length > 0 || r.places.length > 0;
  }

  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }
}
