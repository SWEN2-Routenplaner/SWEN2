import {Component, computed, inject, signal} from '@angular/core';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {ToursStore} from '../../../../states/tours.store';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {TourLog} from '../../../../models/tour-log.model';
import {Router} from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-saved-tours',
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    DatePipe
  ],
  templateUrl: './saved-tours.html',
  styleUrl: './saved-tours.css',
  standalone: true
})
export class SavedToursComponent {
  toursStore = inject(ToursStore);
  activeTourStore = inject(ActiveTourStore);
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router);

  activeTourId = computed(() => this.activeTourStore.activeTour()?.id ?? null);
  tours = this.toursStore.allTours;

  onPanelOpened(id: number) {
    const currentActive = this.activeTourStore.activeTour();
    if (currentActive?.id !== id) {
      const tour = this.toursStore.getTourById(id);
      if (tour) {
        this.activeTourStore.activeTour.set(tour);
      }
    }
    // load this tour's logs from the backend whenever it is expanded
    this.tourLogsStore.loadLogs(id);
  }

  onPanelClosed(id: number) {
    const currentActive = this.activeTourStore.activeTour();
    if (currentActive?.id === id) {
      this.activeTourStore.activeTour.set(null);
    }
  }

  // Loads EditTourComponent into the DOM
  editTour(id: number) {
    this.router.navigate(['', 'edit', id]);
  }

  deleteTour(id: number) {
    if (confirm('Are you sure you want to delete this tour?')) {
      if (this.activeTourId() === id) {
        this.activeTourStore.activeTour.set(null);
      }
      this.toursStore.deleteTour(id);
    }
  }

  getTourLogs(tourId: number): TourLog[] {
    return this.tourLogsStore.getLogsByTourId(tourId);
  }

  getDifficultyClass(difficulty: number): string {
    switch (difficulty) {
      case 1:
        return 'difficulty-easy';
      case 2:
        return 'difficulty-medium';
      case 3:
        return 'difficulty-hard';
      default:
        return '';
    }
  }

  createTourLog(tourId: number, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['', 'tourlogs', 'create', tourId]);
  }

  editTourLog(logId: number) {
    this.router.navigate(['', 'tourlogs', 'edit', logId]);
  }

  deleteTourLog(logId: number) {
    if (confirm('Are you sure you want to delete this tour log?')) {
      this.tourLogsStore.deleteTourLog(logId);
    }
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
