import {Component, inject, signal} from '@angular/core';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {Difficulty} from '../../../../models/tour-log.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-saved-tour-logs',
  imports: [],
  templateUrl: './saved-tour-logs.html',
  styleUrl: './saved-tour-logs.css',
  standalone: true
})
export class SavedTourLogs {
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router)

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
    this.router.navigate(['/tours', 'tourlogs', 'edit', id]);
  }

  protected readonly Difficulty = Difficulty;
}
