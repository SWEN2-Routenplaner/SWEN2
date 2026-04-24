import {Component, computed, inject, signal} from '@angular/core';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {ToursStore} from '../../../../states/tours.store';
import {Observable} from 'rxjs';
import {Tour} from '../../../../models/tour.model';
import {toObservable} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';

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
}
