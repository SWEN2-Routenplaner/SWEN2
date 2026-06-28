import {Component, computed, inject, signal} from '@angular/core';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {ToursStore} from '../../../../states/tours.store';
import {Observable} from 'rxjs';
import {Tour} from '../../../../models/tour.model';
import {toObservable} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {TourLogsStore} from '../../../../states/tour-logs.store';

@Component({
  selector: 'app-saved-tours',
  imports: [],
  templateUrl: './saved-tours.html',
  styleUrl: './saved-tours.css',
  standalone: true
})
export class SavedToursComponent {
  toursStore = inject(ToursStore);
  router = inject(Router);
  tourLogsStore = inject(TourLogsStore);

  activeTourId = signal<number | null>(null)
  tours = this.toursStore.allTours;

  // sets activeTourId to specified id or set to null if already selected
  selectTour(id:number){
    if(this.activeTourId() === id){
      this.activeTourId.set(null);
    }else{
      this.activeTourId.set(id);
    }
  }

  // Loads EditTourComponent into the DOM
  editTour(id:number){
    this.router.navigate(['', 'edit', id]);
  // Loads TourLogsComponent into the DOM
  }
  showLogs(id:number){
    this.router.navigate(['', 'tourlogs', id]);
  }
  //Calculates popularity of a tour based on the number of logs associated with it
  calculatePopularity(tourId: number): string {
    const logs = this.tourLogsStore.getLogsByTourId(tourId);
    if(logs.length === 0) {
      return "No logs yet";
    }
    if(logs.length < 3) {
      return "Not very popular";
    }
    if(logs.length < 5) {
      return "Somewhat popular";
    }
    if(logs.length < 10) {
      return "Popular";
    }
    return "Very popular";
  }
}
