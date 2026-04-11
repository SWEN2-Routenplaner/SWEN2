import {Component, inject, OnInit, signal} from '@angular/core';
import {ToursStore} from '../../../../states/tours.store';
import {Tour, TransportMode} from '../../../../models/tour.model';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-update-tour',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './update-tour.html',
  styleUrl: './update-tour.css',
})
export class UpdateTourComponent{
  toursStore = inject(ToursStore);
  errors = signal<string[]>([]);
  corrects = signal<string[]>([]);
  message = signal<string>('');
  router = inject(Router);
  id: number | null = null;

  tourForm = new FormGroup({
    from: new FormControl('',{validators:[Validators.required], nonNullable: true}),
    to: new FormControl('',{validators:[Validators.required], nonNullable: true}),
    intermediateStops: new FormArray<FormControl<string>>([]),
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
        const stopsArray = this.tourForm.controls.intermediateStops;
        activeTour.intermediateStops?.forEach(stop => {
          stopsArray.push(new FormControl(stop, {validators:[Validators.required], nonNullable: true}));
        });
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
    // unselect if already selected
    if(this.selectedMode() === mode){
      this.selectedMode.set(null);
      this.tourForm.patchValue({transportMode: null});
    }else{
      this.selectedMode.set(mode);
      this.tourForm.patchValue({transportMode: mode});
    }
  }

  getStops(){
    return this.tourForm.controls.intermediateStops;
  }

  removeStop(index:number){
    this.getStops().removeAt(index);
  }

  addStop(){
    this.getStops().push(new FormControl('',{validators:[Validators.required],nonNullable: true}));
  }

  saveTour(){
    this.setErrorsAndCorrects();
    if(this.tourForm.valid){
      const tour = this.tourForm.getRawValue() as Tour;
      const id: number | null = this.id;
      if(id){
        tour.id = id;
        this.toursStore.updateTour(tour);
        this.message.set('Tour updated successfully!');
      }else{
        console.error("Tour not found");
      }
    }else{
      this.message.set('Please fill in all fields!');
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
    // check if intermediate stops are valid
    this.getStops().controls.forEach((control, index) => {
      if(control.invalid) {
        this.errors().push(`stop-${index}`);
      }else{
        this.corrects().push(`stop-${index}`);
      }
    })
  }

  deleteTour(){
    if(this.id){
      //
      this.toursStore.deleteTour(this.id);
      this.router.navigate(['/tours']);
    }
  }

  back(){
    this.router.navigate(['/tours']);
  }
}
