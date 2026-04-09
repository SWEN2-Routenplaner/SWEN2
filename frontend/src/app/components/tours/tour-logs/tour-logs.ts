import {Component, inject, signal} from '@angular/core';
import {ToursStore} from '../../../states/tours.store';
import {TourLogsMetaStore} from './tour-logs-meta.store';
import {ToursMetaStore} from '../tours-meta.store';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UpdateTourLog} from './update-tour-log/update-tour-log';
import {SavedTourLogs} from './saved-tour-logs/saved-tour-logs';

@Component({
  selector: 'app-tour-logs',
  imports: [
    UpdateTourLog,
    SavedTourLogs
  ],
  templateUrl: './tour-logs.html',
  styleUrl: './tour-logs.css',
  standalone: true
})
export class TourLogsComponent {
  tourLogsStore = inject(TourLogsMetaStore);
}
