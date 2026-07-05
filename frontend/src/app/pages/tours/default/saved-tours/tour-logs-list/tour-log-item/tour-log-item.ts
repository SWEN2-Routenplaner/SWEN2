import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TourLogsStore } from '../../../../../../states/tour-logs.store';
import { TourLog } from '../../../../../../models/tour-log.model';

@Component({
  selector: 'app-tour-log-item',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    DatePipe
  ],
  templateUrl: './tour-log-item.html',
  styleUrl: './tour-log-item.css'
})
export class TourLogItemComponent {
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router);

  @Input({ required: true }) log!: TourLog;

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

  editTourLog(logId: number) {
    this.router.navigate(['', 'tourlogs', 'edit', logId]);
  }

  deleteTourLog(logId: number) {
    if (confirm('Are you sure you want to delete this tour log?')) {
      this.tourLogsStore.deleteTourLog(logId);
    }
  }
}
