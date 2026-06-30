import {Component, inject, OnInit, signal} from '@angular/core';
import {ToursStore} from '../../../states/tours.store';
import {ActiveTourStore} from '../../../states/active-tour-store';
import {Tour, TransportMode} from '../../../models/tour.model';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-update-tour',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './update-tour.html',
  styleUrl: './update-tour.css',
})
export class UpdateTourComponent{
  toursStore = inject(ToursStore);
  activeTourStore = inject(ActiveTourStore);
  errors = signal<string[]>([]);
  corrects = signal<string[]>([]);
  message = signal<string>('');
  router = inject(Router);
  saving = signal(false);
  saveSuccess = signal(false);
  confirmDelete = signal(false);
  id: number | null = null;

  tourForm = new FormGroup({
    from: new FormControl('',{validators:[Validators.required], nonNullable: true}),
    to: new FormControl('',{validators:[Validators.required], nonNullable: true}),
    transportMode: new FormControl<string | null>('',{validators:[Validators.required], nonNullable: true}),
    name: new FormControl('',{validators:[Validators.required], nonNullable: true}),
    description: new FormControl(''),
  })

  // Load Selected Tour on init
  constructor(route: ActivatedRoute) {
    this.id = Number(route.snapshot.params['id']);
    if(this.id){
      const activeTour = this.toursStore.getTourById(this.id);
      if(activeTour){
        this.tourForm.patchValue(activeTour);
        this.selectedMode.set(activeTour.transportMode);
      }else{
        console.error("Tour not found");
        return;
      }
    }
  }

  // UI variables
  selectedMode = signal<string | null>('');

  toggleTransportMode(mode: TransportMode): void {
    if (this.saving() || this.saveSuccess()) return;
    // unselect if already selected
    if(this.selectedMode() === mode){
      this.selectedMode.set(null);
      this.tourForm.patchValue({transportMode: null});
    }else{
      this.selectedMode.set(mode);
      this.tourForm.patchValue({transportMode: mode});
    }
  }


  saveTour(){
    this.setErrorsAndCorrects();
    if(this.tourForm.valid && !this.saving() && !this.saveSuccess()){
      this.saving.set(true);
      const tour = this.tourForm.getRawValue() as Tour;
      const id: number | null = this.id;
      if(id){
        tour.id = id;
        this.toursStore.updateTour(tour);

        // Update active tour store if this was the active tour
        const currentActive = this.activeTourStore.activeTour();
        if (currentActive?.id === id) {
          this.activeTourStore.activeTour.set(tour);
        }

        setTimeout(() => {
          this.saving.set(false);
          this.saveSuccess.set(true);
          setTimeout(() => {
            this.router.navigate(['']);
          }, 800);
        }, 600);
      }else{
        console.error("Tour not found");
        this.saving.set(false);
      }
    }
  }

  // sets errors and corrects arrays based on form validity
  setErrorsAndCorrects(){
    this.errors.set([]); // first clear errors
    this.corrects.set([]);
    const controls = this.tourForm.controls;
    if(controls.from.invalid) {
      this.errors().push('from')
    }else{
      this.corrects().push('from')
    }
    if(controls.to.invalid){
      this.errors().push('to')
    }else{
      this.corrects().push('to')
    }
    if(controls.transportMode.invalid){
      this.errors().push('transportMode');
    }else{
      this.corrects().push('transportMode');
    }
    if(controls.name.invalid){
      this.errors().push('name')
    }else{
      this.corrects().push('name')
    }

    this.corrects().push('description'); // always correct description (even empty)
  }

  triggerDelete(){
    this.confirmDelete.set(true);
  }

  cancelDelete(){
    this.confirmDelete.set(false);
  }

  deleteTour(){
    if(this.id){
      // Clear active tour if it is deleted
      const currentActive = this.activeTourStore.activeTour();
      if (currentActive?.id === this.id) {
        this.activeTourStore.activeTour.set(null);
      }
      this.toursStore.deleteTour(this.id);
      this.router.navigate(['']);
    }
  }

  back(){
    this.router.navigate(['']);
  }
}
