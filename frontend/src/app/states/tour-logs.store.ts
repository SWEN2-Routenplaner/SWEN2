import {Injectable, signal} from '@angular/core';
import {TourLog} from '../models/tour-log.model';

@Injectable({ providedIn: 'root'})
export class TourLogsStore {
  private tourLogs = signal<TourLog[]>([]);
  readonly allLogs = this.tourLogs.asReadonly();

  //Load mock tour logs on init
  constructor() {
    this.loadMockTourLogs();
  }

  getLogsByTourId(tourId: number): TourLog[] {
    return this.tourLogs().filter(log => log.tourId === tourId);
  }
  addTourLog(tourLog: TourLog): void {
    this.tourLogs.update(tourLogs => [...tourLogs, tourLog]);
    console.log("saved tour log " + tourLog.id + " to tour logs array")
    console.log(this.tourLogs())
  }

  getTourLogById(id: number): TourLog | undefined {
    return this.tourLogs().find(tourLog => tourLog.id === id);
  }

  getTourLogs(): TourLog[] {
    return this.tourLogs();
  }

  updateTourLog(tourLog: TourLog): void {
    this.tourLogs.update(tourLogs => tourLogs.map(t => t.id === tourLog.id ? tourLog : t));
  }

  deleteTourLog(id: number): void {
    this.tourLogs.update(tourLogs => tourLogs.filter(tourLog => tourLog.id !== id));
  }

  //////////////////////////
  /// MOCK DELETE LATER! ///
  //////////////////////////

  getNextId(): number{
    const maxId = Math.max(...this.tourLogs().map(tourLog => tourLog.id));
    return maxId + 1;
  }

  private loadMockTourLogs() {
    this.tourLogs.set([])
  }
}
