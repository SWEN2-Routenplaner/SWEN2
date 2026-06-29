import {Component, inject, signal} from '@angular/core';
import {ToursStore} from '../../../../states/tours.store';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {Difficulty, Rating, TourLog} from '../../../../models/tour-log.model';
import {ActivatedRoute, Router} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-update-tour-log',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
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
  saving = signal(false);
  saveSuccess = signal(false);
  confirmDelete = signal(false);

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
    // determine mode from params
    if(route.snapshot.params['tourId']){
      this.mode.set('create');
    }else if(route.snapshot.params['logId']){
      this.mode.set('edit');
    }

    switch (this.mode()) {
      case 'edit':
        this.logId = Number(route.snapshot.params['logId']);
        const activeLog: TourLog | undefined = this.tourLogsStore.getTourLogById(this.logId);
        if(activeLog){
          this.toursId = activeLog.tourId;
          this.tourLogForm.patchValue(activeLog);
        }else{
          console.error("Tour Log not found");
          this.router.navigate(['']);
        }
        break;
        case 'create':
          this.toursId = Number(route.snapshot.params['tourId']);
          break;
        default:
          console.error("Error! no active tour or log");
          this.router.navigate(['']);
    }
  }

  getTourName(tourId: number|null){
    if(tourId){
      const tour = this.toursStore.getTourById(tourId);
      return tour?.name;
    }else{
      return null;
    }
  }

  saveTourLog(){
    this.setErrorsAndCorrects();
    if(this.tourLogForm.valid && !this.saving() && !this.saveSuccess()){
      this.saving.set(true);
      const rawData = this.tourLogForm.getRawValue();

      const tourLog: TourLog = {
        ...rawData,
        difficulty: Number(rawData.difficulty),
        rating: Number(rawData.rating)
      } as TourLog;

      switch (this.mode()) {
        case 'edit':
          if(this.logId && this.toursId){
            tourLog.id = this.logId;
            tourLog.tourId = this.toursId;
            tourLog.date = new Date();
            this.tourLogsStore.updateTourLog(tourLog);
            
            setTimeout(() => {
              this.saving.set(false);
              this.saveSuccess.set(true);
              setTimeout(() => {
                this.router.navigate(['']);
              }, 800);
            }, 600);
          }
          break;
        case 'create':
          if(this.toursId){
            tourLog.tourId = this.toursId;
            tourLog.id = this.tourLogsStore.getNextId();
            tourLog.date = new Date();
            this.tourLogsStore.addTourLog(tourLog);
            
            setTimeout(() => {
              this.saving.set(false);
              this.saveSuccess.set(true);
              setTimeout(() => {
                this.router.navigate(['']);
              }, 800);
            }, 600);
          }
          break;
        default:
          console.error("Error! no active tour or log");
          this.saving.set(false);
          break;
      }
    }
  }

  triggerDelete(){
    this.confirmDelete.set(true);
  }

  cancelDelete(){
    this.confirmDelete.set(false);
  }

  deleteTourLog(){
    if(this.logId && this.toursId){
      this.tourLogsStore.deleteTourLog(this.logId);
      this.router.navigate(['']);
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
    this.router.navigate(['']);
  }
}
