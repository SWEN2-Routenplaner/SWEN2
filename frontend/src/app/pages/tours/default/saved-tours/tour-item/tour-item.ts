import { Component, Input, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActiveTourStore } from '../../../../../states/active-tour-store';
import { ToursStore } from '../../../../../states/tours.store';
import { TourLogsStore } from '../../../../../states/tour-logs.store';
import { Tour } from '../../../../../models/tour.model';
import { TourLogsListComponent } from '../tour-logs-list/tour-logs-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tour-item',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TourLogsListComponent
  ],
  templateUrl: './tour-item.html',
  styleUrl: './tour-item.css'
})
export class TourItemComponent {
  toursStore = inject(ToursStore);
  activeTourStore = inject(ActiveTourStore);
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router);
  http = inject(HttpClient);

  @Input({ required: true }) tour!: Tour;

  activeTourId = computed(() => this.activeTourStore.activeTour()?.id ?? null);

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
      withCredentials: true
    })
    .subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const filename = name.replace(/\s+/g, '_');
        link.setAttribute('download', `${filename}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error) => {
        console.error('Error downloading tour:', error);
        alert('Failed to download tour. Please try again later.');
      }
    });
  }

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
