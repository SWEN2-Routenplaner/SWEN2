import {Component, computed, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {TransportMode} from '../../../../models/tour.model';
import {ToursStore} from '../../../../states/tours.store';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-new-tour',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './new-tour.html',
  styleUrl: './new-tour.css',
  standalone: true
})
export class NewTourComponent {
  toursStore = inject(ToursStore)
  activeTourStore = inject(ActiveTourStore)
  router = inject(Router)

  message = signal('');
  saving = signal(false);
  saveSuccess = signal(false);
  selectedMode = signal<TransportMode>(null);

  tourForm = new FormGroup({
    from: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    to: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    transportMode: new FormControl<string | null>('', {validators: [Validators.required], nonNullable: true}),
    name: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    description: new FormControl(''),
  })

  private formValue = toSignal(this.tourForm.valueChanges, {initialValue: this.tourForm.value});

  // activates save button if all necessary fields are filled
  validInput = computed(()=> {
    const form = this.formValue();
    const mode = this.selectedMode();

    if (form.from && form.to && mode && form.name) {
      return true;
    }
    return false;
  })

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

  saveTour(): void {
    if(this.validInput() && !this.saving() && !this.saveSuccess()){
      this.saving.set(true);
      const rawData = this.tourForm.getRawValue();
      // remove html tags and trim whitespaces
      const sanitize = (value: string) => value
        .replace(/<[^>]*>/g, '')
        .trim();

      // create a cleaned object
      const tour = {
        ...rawData,
        from: sanitize(rawData.from || 'Invalid Location'),
        to: sanitize(rawData.to || 'Invalid Location'),
        transportMode: this.selectedMode(),
        name: sanitize(rawData.name || 'New Tour'),
        description: sanitize(rawData.description || ''),
        id: this.toursStore.getNextId(),
        distance: 0,
        estimatedDuration: 0,
      }

      this.toursStore.addTour(tour)
      this.activeTourStore.activeTour.set(tour);

      setTimeout(() => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => {
          this.tourForm.reset();
          this.selectedMode.set(null);
          this.router.navigate(['/']);
        }, 800);
      }, 600);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
