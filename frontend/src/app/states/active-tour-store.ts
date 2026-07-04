import {Injectable, computed, signal, model} from '@angular/core';
import {Tour} from '../models/tour.model';
import {Observable} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';

@Injectable({providedIn: 'root'})
export class ActiveTourStore {
  // Original states (Model)
  readonly activeTour = signal<Tour | null>(null);

  // Map selection bridge states
  readonly selectedPoi = signal<{ name: string, lon: number, lat: number, category?: string } | null>(null);
  readonly selectionTarget = signal<'from' | 'to' | null>(null);
  readonly previewRouteGeometry = signal<string | null>(null);

  // Map viewport events
  readonly mapViewRequest = signal<{ lat: number, lon: number } | null>(null);

  // Derived states (View Model/Computed)
  readonly activeTour$ = toObservable(this.activeTour);
}
