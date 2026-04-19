import {Component, inject, signal} from '@angular/core';
import {SavedTourLogs} from './saved-tour-logs/saved-tour-logs';
import {TourLogsStore} from '../../../states/tour-logs.store';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-tour-logs',
  imports: [
    SavedTourLogs,
    RouterOutlet
  ],
  templateUrl: './tour-logs.html',
  styleUrl: './tour-logs.css',
  standalone: true
})
export class TourLogsComponent {
  tourLogsStore = inject(TourLogsStore);
}
