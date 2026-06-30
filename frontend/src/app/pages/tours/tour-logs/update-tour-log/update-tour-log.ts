import {Component, inject, signal} from '@angular/core';
import {ToursStore} from '../../../../states/tours.store';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TourLogsStore} from '../../../../states/tour-logs.store';
import {TourLog} from '../../../../models/tour-log.model';
import {TourLogCreateRequest, TourLogUpdateRequest} from '../../../../models/tour-log.dto';
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
    {value: 1, label: 'Easy'},
    {value: 2, label: 'Medium'},
    {value: 3, label: 'Hard'},
  ];

  ratingOptions = [
    {value: 1, label: 'Poor'},
    {value: 2, label: 'Fair'},
    {value: 3, label: 'Good'},
    {value: 4, label: 'Very Good'},
    {value: 5, label: 'Excellent'},
  ]

  toursStore = inject(ToursStore);
  tourLogsStore = inject(TourLogsStore);
  router = inject(Router)
  toursId: number|null = null;
  logId: number|null = null;
  private existingDateTime: string | null = null;

  mode = signal<'edit' | 'create' | null>(null);
  errors = signal<string[]>([]);
  corrects = signal<string[]>([]);
  message = signal<string>('');
  saving = signal(false);
  saveSuccess = signal(false);
  confirmDelete = signal(false);

  tourLogForm = new FormGroup({
    difficulty: new FormControl<number | null>(null, {
      validators: [Validators.required],
      nonNullable: true}),
    totalDistance: new FormControl<number | null>(null,{
      validators: [Validators.required],
      nonNullable: true}),
    totalTime: new FormControl<number | null>(null,{
      validators: [Validators.required],
      nonNullable: true}),
    rating: new FormControl<number | null>(null, {
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
          this.existingDateTime = activeLog.dateTime;
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
      const tour = this.toursStore.allTours().find(t => t.id === tourId);
      return tour?.name;
    }else{
      return null;
    }
  }

  saveTourLog(){
    this.setErrorsAndCorrects();
    if(this.tourLogForm.valid && !this.saving() && !this.saveSuccess()){
      this.saving.set(true);

      switch (this.mode()) {
        case 'edit':
          if(this.logId && this.toursId){
            const body: TourLogUpdateRequest = {
              ...this.buildRequestBody(),
              // keep the original timestamp, fall back to now if it was missing
              dateTime: this.existingDateTime ?? new Date().toISOString(),
            };
            this.tourLogsStore.updateTourLog(this.logId, body).subscribe({
              next: () => this.onSaveSuccess(),
              error: () => this.saving.set(false),
            });
          }
          break;
        case 'create':
          if(this.toursId){
            const body: TourLogCreateRequest = this.buildRequestBody();
            this.tourLogsStore.addTourLog(this.toursId, body).subscribe({
              next: () => this.onSaveSuccess(),
              error: () => this.saving.set(false),
            });
          }
          break;
        default:
          console.error("Error! no active tour or log");
          this.saving.set(false);
          break;
      }
    }
  }

  private buildRequestBody(): TourLogCreateRequest {
    const rawData = this.tourLogForm.getRawValue();
    return {
      dateTime: new Date().toISOString(),
      comment: rawData.comment ?? '',
      difficulty: Number(rawData.difficulty),
      totalDistance: Number(rawData.totalDistance),
      totalTime: Number(rawData.totalTime),
      rating: Number(rawData.rating),
    };
  }

  private onSaveSuccess(){
    this.saving.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => {
      this.router.navigate(['']);
    }, 800);
  }

  triggerDelete(){
    this.confirmDelete.set(true);
  }

  cancelDelete(){
    this.confirmDelete.set(false);
  }

  deleteTourLog(){
    if(this.logId && this.toursId){
      this.tourLogsStore.deleteTourLog(this.logId).subscribe({
        next: () => this.router.navigate(['']),
        error: () => this.confirmDelete.set(false),
      });
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
