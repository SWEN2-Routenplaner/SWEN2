import {Component, inject, signal} from '@angular/core';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {TourLogsMetaStore} from '../tour-logs-meta.store';
import {Difficulty} from '../../../../models/tour-log.model';

@Component({
  selector: 'app-saved-tour-logs',
  imports: [],
  templateUrl: './saved-tour-logs.html',
  styleUrl: './saved-tour-logs.css',
  standalone: true
})
export class SavedTourLogs {
  tourLogsStore = inject(TourLogsStore);
  tourLogsMetaStore = inject(TourLogsMetaStore);

  activeTourLogId = signal<number | null>(null);
  tourlogs = this.tourLogsStore.allTours;

  // sets activeTourLogId to specified id or set to null if already selected
  selectTourLog(id:number){
    if(this.activeTourLogId() === id){
      this.activeTourLogId.set(null);
    }else{
      this.activeTourLogId.set(id);
    }
  }

  editTourLog(id:number){
    this.tourLogsMetaStore.setSelectedLogId(id);
    this.tourLogsMetaStore.setMode("edit");
  }

  protected readonly Difficulty = Difficulty;
}
