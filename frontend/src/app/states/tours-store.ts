import {Injectable, computed, signal, model} from '@angular/core';
import {Tour} from '../models/tour.model';

@Injectable({providedIn: 'root'})
export class ToursStore {
  // Mock Tours
  private tours = signal <Tour[]>([]);
  readonly allTours = this.tours.asReadonly();

  // Load mock tours on init
  constructor() {
    this.loadMockTours();
  }

  // Original states (Model)

  //Derived states (View Model/Computed)
  addTour(tour: Tour): void {
    this.tours.update(tours => [...tours, tour]);
    // log whole tour
    console.log("saved tour " + tour.id + " to tours array")
  }

  getTourById(id: number): Tour | undefined {
    return this.tours().find(tour => tour.id === id);
  }

  getTours(): Tour[] {
    return this.tours();
  }

  updateTour(tour: Tour): void {
    this.tours.update(tours => tours.map(t => t.id === tour.id ? tour : t));
  }

  deleteTour(id: number): void {
    this.tours.update(tours => tours.filter(tour => tour.id !== id));
  }

  getNextId(): number {
    // search for the max id in the tours array
    const maxId = Math.max(...this.tours().map(tour => tour.id));
    return maxId + 1;
  }

  loadMockTours(): void {
    this.tours.set([
      {id: 1, from: 'Berlin', to: 'Munich', transportMode: "bike", name: 'Berlin-Munich', description: 'A short tour from Berlin to Munich', intermediateStops: []},
      {id: 2, from: 'Munich', to: 'Berlin', transportMode: "car", name: 'Munich-Berlin', description: 'A short tour from Munich to Berlin', intermediateStops: []},
    ])
  }
}
