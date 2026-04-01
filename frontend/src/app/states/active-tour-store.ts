import {Injectable, computed, signal, model} from '@angular/core';
import {Tour} from '../models/tour.model';
import {Observable} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';

@Injectable({providedIn: 'root'})
export class ActiveTourStore {
  // Original states (Model)
  readonly activeTour = signal<Tour | null>(null);

  // Derived states (View Model/Computed)
  readonly activeTour$ = toObservable(this.activeTour);
}
