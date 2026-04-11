import {Component, computed, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {ToursStore} from '../../../../states/tours-store';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {Tour} from '../../../../models/tour.model';
import {TransportMode} from '../../../../models/tour.model';

@Component({
  selector: 'app-new-tour',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule
  ],
  templateUrl: './new-tour.html',
  styleUrl: './new-tour.css',
  standalone: true
})
export class NewTourComponent {
  toursStore = inject(ToursStore)
  activeTourStore = inject(ActiveTourStore)

  message = signal('');
  expanded = signal(false);
  selectedMode = signal<TransportMode>(null);
  intermediateStops = signal<string[]>([]);

  tourForm = new FormGroup({
    from: new FormControl(''),
    to: new FormControl(''),
    transportMode: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl(''),
  })

  private formValue = toSignal(this.tourForm.valueChanges, {initialValue: this.tourForm.value});

  // activates save button if all necessary fields are filled
  validInput = computed(()=> {
    // need to be defined for validInput to be reactive on new inputs
    const form = this.formValue();
    const mode = this.selectedMode();

    if (form.from && form.to && mode) {
      return true;
    }
    return false;
  })

  addStop(): void {
    this.intermediateStops.update(stops => [...stops, '']);
  }

  removeStop(index: number): void {
    this.intermediateStops.update(stops => stops.filter((_, i) => i !== index));
  }

  updateStop(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.intermediateStops.update(stops => stops.map((s, i) => i === index ? value : s));
  }

  toggleTransportMode(mode: TransportMode): void {
    // unselect if already selected
    if(this.selectedMode() === mode){
      this.selectedMode.set(null);
    }else{
      this.selectedMode.set(mode);
      this.tourForm.patchValue({transportMode: mode});
    }
  }

  toggleExpanded(): void {
    this.expanded.update(expanded => !expanded);
  }

  saveTour(): void {
    if(this.validInput()){
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
        intermediateStops: this.intermediateStops().map(s => sanitize(s)).filter(s => s.length > 0),
        id: this.toursStore.getNextId()
      }

      this.toursStore.addTour(tour)

      this.tourForm.reset();

      this.selectedMode.set(null);
      this.intermediateStops.set([]);
      this.expanded.set(false);
      this.message.set('Tour saved!');
    }else{
      this.message.set('Fill in all fields!');
    }
  }
}
