import {Component, inject, signal} from '@angular/core';
import {ToursStore} from '../../../../states/tours.store';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {Difficulty, Rating, TourLog} from '../../../../models/tour-log.model';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-update-tour-log',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './update-tour-log.html',
  styleUrl: './update-tour-log.css',
  standalone: true
})
export class UpdateTourLogComponent {

  difficultyOptions = [
    {value: Difficulty.Easy, label: 'Easy'},
    {value: Difficulty.Medium, label: 'Medium'},
    {value: Difficulty.Hard, label: 'Hard'},
  ];

  ratingOptions = [
    {value: Rating.POOR, label: 'Poor'},
    {value: Rating.FAIR, label: 'Fair'},
    {value: Rating.GOOD, label: 'Good'},
    {value: Rating.VERY_GOOD, label: 'Very Good'},
    {value: Rating.EXCELLENT, label: 'Excellent'},
  ]

  toursStore = inject(ToursStore);
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router)
  toursId: number|null = null;
  logId: number|null = null;

  mode = signal<'edit' | 'create' | null>(null);
  errors = signal<string[]>([]);
  corrects = signal<string[]>([]);
  message = signal<string>('');

  tourLogForm = new FormGroup({
    difficulty: new FormControl<Difficulty | null>(null, {
      validators: [Validators.required],
      nonNullable: true}),
    totalDistance: new FormControl<number | null>(null,{
      validators: [Validators.required],
      nonNullable: true}),
    totalTime: new FormControl<number | null>(null,{
      validators: [Validators.required],
      nonNullable: true}),
    rating: new FormControl<Rating | null>(null, {
      validators: [Validators.required],
      nonNullable: true}),
    comment: new FormControl(''),
  })

  constructor(route: ActivatedRoute){
    this.logId = Number(route.snapshot.params['id']);

    // Edit Mode
    if(this.logId){
      const activeLog: TourLog | undefined = this.tourLogsStore.getTourLogById(this.logId);
      if(activeLog){
        this.toursId = activeLog.tourId;
        this.tourLogForm.patchValue(activeLog);
        this.mode.set('edit');
      }
    // Error! no active tour or log (No tour for reference!)
    }else if(!this.toursId || !this.logId){
      console.error("Error! no active tour or log");
      this.router.navigate(['/tours']);
      // Create Mode
    }else{
      this.mode.set('create');
    }
  }

  getTourName(tourId: number){
    const tour = this.toursStore.getTourById(tourId);
    return tour?.name;
  }

  saveTourLog(){
    this.setErrorsAndCorrects();
    if(this.tourLogForm.valid){
      const tourLog = this.tourLogForm.getRawValue() as TourLog;

      switch (this.mode()) {
        case 'edit':
          if(this.logId && this.toursId){
            tourLog.id = this.logId;
            this.tourLogsStore.updateTourLog(tourLog);
            this.message.set('Tour Log updated successfully!');
          }
          break;
        case 'create':
          if(this.toursId){
            tourLog.tourId = this.toursId;
            tourLog.id = this.tourLogsStore.getNextId();
            this.tourLogsStore.addTourLog(tourLog);
            this.message.set('Tour Log created successfully!');
          }
          break;
        default:
          console.error("Error! no active tour or log");
          break;
      }
    }
  }

  private setErrorsAndCorrects() {
    this.errors.set([]);
    this.corrects.set([]);
    const controls = this.tourLogForm.controls;
    if (controls.difficulty.invalid) {
      this.errors().push('difficulty');
    } else {
      this.corrects().push('difficulty');
    }
    if (controls.totalDistance.invalid) {
      this.errors().push('totalDistance');
    } else {
      this.corrects().push('totalDistance');
    }
    if (controls.totalTime.invalid) {
      this.errors().push('totalTime');
    }else{
      this.corrects().push('totalTime');
    }
    if (controls.rating.invalid) {
      this.errors().push('rating');
    }else{
      this.corrects().push('rating');
    }
    // always correct comment (even empty)
    this.corrects().push('comment');
  }

  back(){
    if(this.toursId){
      console.log(this.toursId)
      this.router.navigate(['/tours','tourlogs', this.toursId]);
    }else{
      console.error("Error! no active tour");
      this.router.navigate(['/tours']);
    }
  }

}
