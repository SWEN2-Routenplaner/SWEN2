import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TourLogsStore } from '../../../../../states/tour-logs.store';
import { TourLog } from '../../../../../models/tour-log.model';
import { TourLogItemComponent } from './tour-log-item/tour-log-item';

@Component({
  selector: 'app-tour-logs-list',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    TourLogItemComponent
  ],
  templateUrl: './tour-logs-list.html',
  styleUrl: './tour-logs-list.css'
})
export class TourLogsListComponent {
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router);

  @Input({ required: true }) tourId!: number;

  getTourLogs(): TourLog[] {
    return this.tourLogsStore.getLogsByTourId(this.tourId);
  }

  createTourLog(event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['', 'tourlogs', 'create', this.tourId]);
  }
}
