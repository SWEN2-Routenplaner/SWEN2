import {Component, inject, signal} from '@angular/core';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {Difficulty, TourLog} from '../../../../models/tour-log.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-saved-tour-logs',
  imports: [
    DatePipe
  ],
  templateUrl: './saved-tour-logs.html',
  styleUrl: './saved-tour-logs.css',
  standalone: true
})
export class SavedTourLogs {
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router)

  activeTourLogId = signal<number | null>(null);
  tourId: number | null = null;

  constructor(route: ActivatedRoute){
    this.tourId = Number(route.snapshot.params['id']);
  }

  getTourLogs(){
    if(this.tourId){
      return this.tourLogsStore.getLogsByTourId(this.tourId)
    }else{
      return []
    }
  }

  // sets activeTourLogId to specified id or set to null if already selected
  selectTourLog(id:number){
    if(this.activeTourLogId() === id){
      this.activeTourLogId.set(null);
    }else{
      this.activeTourLogId.set(id);
    }
  }

  editTourLog(id:number){
    this.router.navigate(['', 'tourlogs', 'edit', id]);
  }

  protected readonly Difficulty = Difficulty;

  protected newTourLog() {
    if(this.tourId){
      this.router.navigate(['', 'tourlogs', 'create', this.tourId]);
    }else{
      console.error("Error! no active tour");
      this.router.navigate(['']);
    }
  }

  protected back() {
    this.router.navigate(['']);
  }
}
