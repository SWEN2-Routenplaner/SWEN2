import {Component, computed, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {TransportType} from '../../../../models/tour.model';
import {ToursStore} from '../../../../states/tours.store';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TourCreateRequest} from '../../../../models/tour.dto';

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
  saveError = signal<string | null>(null);
  selectedType = signal<TransportType>(null);

  tourForm = new FormGroup({
    from: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    to: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    TransportType: new FormControl<string | null>('', {validators: [Validators.required], nonNullable: true}),
    name: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    description: new FormControl(''),
  })

  private formValue = toSignal(this.tourForm.valueChanges, {initialValue: this.tourForm.value});

  // activates save button if all necessary fields are filled
  validInput = computed(()=> {
    const form = this.formValue();
    const mode = this.selectedType();

    if (form.from && form.to && mode && form.name) {
      return true;
    }
    return false;
  })

  toggleTransportType(mode: TransportType): void {
    if (this.saving() || this.saveSuccess()) return;
    // unselect if already selected
    if(this.selectedType() === mode){
      this.selectedType.set(null);
      this.tourForm.patchValue({TransportType: null});
    }else{
      this.selectedType.set(mode);
      this.tourForm.patchValue({TransportType: mode});
    }
  }

  saveTour(): void {
    if(this.validInput() && !this.saving() && !this.saveSuccess()){
      this.saving.set(true);
      this.saveError.set(null);

      const rawData = this.tourForm.getRawValue();
      // remove html tags and trim whitespaces
      const sanitize = (value: string) => value
        .replace(/<[^>]*>/g, '')
        .trim();

      const body: TourCreateRequest = {
        from: sanitize(rawData.from || 'Invalid Location'),
        to: sanitize(rawData.to || 'Invalid Location'),
        transportType: this.selectedType()!,
        name: sanitize(rawData.name || 'New Tour'),
        description: sanitize(rawData.description || ''),
      };

      this.toursStore.addTour(body).subscribe({
        next: (createdTour) => {
          this.activeTourStore.activeTour.set(createdTour);
          this.saving.set(false);
          this.saveSuccess.set(true);

          setTimeout(() => {
            this.tourForm.reset();
            this.selectedType.set(null);
            this.router.navigate(['/']);
          }, 800);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Failed to save tour. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
