import {Injectable, signal} from '@angular/core';
import {Difficulty, Rating, TourLog} from '../models/tour-log.model';

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
    this.tourLogs.set([
      {
        id: 101,
        tourId: 1,
        date: new Date('2026-03-15'),
        comment: 'A bit muddy near the start, but the view at the summit was worth it!',
        difficulty: Difficulty.Medium,
        totalDistance: 12.5,
        totalTime: 240, // in minutes
        rating: Rating.VERY_GOOD
      },
      {
        id: 102,
        tourId: 1,
        date: new Date('2026-03-22'),
        comment: 'Perfect weather conditions. Trail was well maintained.',
        difficulty: Difficulty.Easy,
        totalDistance: 12.5,
        totalTime: 210,
        rating: Rating.EXCELLENT
      },
      {
        id: 103,
        tourId: 2,
        date: new Date('2026-04-01'),
        comment: 'Very steep incline at the 5km mark. Definitely a workout.',
        difficulty: Difficulty.Hard,
        totalDistance: 8.2,
        totalTime: 180,
        rating: Rating.GOOD
      },
      {
        id: 104,
        tourId: 2,
        date: new Date('2026-04-05'),
        comment: 'Took a wrong turn and ended up doing extra mileage. Great birdsong though.',
        difficulty: Difficulty.Medium,
        totalDistance: 10.5,
        totalTime: 220,
        rating: Rating.FAIR
      }
    ])
  }
}
