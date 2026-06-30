import {Component, computed, inject, signal} from '@angular/core';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {ToursStore} from '../../../../states/tours.store';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {Difficulty, TourLog} from '../../../../models/tour-log.model';
import {Router} from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {DatePipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';



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
  http = inject(HttpClient);

  activeTourId = computed(() => this.activeTourStore.activeTour()?.id ?? null);
  tours = this.toursStore.allTours;

  protected readonly Difficulty = Difficulty;

  onPanelOpened(id: number) {
    const currentActive = this.activeTourStore.activeTour();
    if (currentActive?.id !== id) {
      const tour = this.toursStore.getTourById(id);
      if (tour) {
        this.activeTourStore.activeTour.set(tour);
      }
    }
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

  downloadTour(tourId: number, name: string) {
    this.http.get(`http://localhost:8080/api/tours/${tourId}/export`, { 
      responseType: 'blob',
      withCredentials: true})
    .subscribe({next: (response: Blob) => {
      //Create a blob from the response and create a download link
      const blob = new Blob([response], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      const filename = name.replace(/\s+/g, '_');
      link.setAttribute('download', `${filename}.json`);

      //Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, error: (error) => {
      console.error('Error downloading tour:', error);
      alert('Failed to download tour. Please try again later.');
    }
    });
  }

  getTourLogs(tourId: number): TourLog[] {
    return this.tourLogsStore.getLogsByTourId(tourId);
  }

  getDifficultyClass(difficulty: Difficulty): string {
    switch (difficulty) {
      case Difficulty.Easy:
        return 'difficulty-easy';
      case Difficulty.Medium:
        return 'difficulty-medium';
      case Difficulty.Hard:
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
    if(logs.length < 5) {
      return "😔";
    }
    if(logs.length < 10) {
      return "😐";
    }
    return "😁";
  }
}
