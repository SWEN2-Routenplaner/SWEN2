import {Component, computed, inject, signal, effect} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {TransportType} from '../../../../models/tour.model';
import {ToursStore} from '../../../../states/tours.store';
import {ActiveTourStore} from '../../../../states/active-tour-store';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TourCreateRequest} from '../../../../models/tour.dto';
import {LocationAutocompleteComponent, LocationSuggestion} from '../../../../components/location-autocomplete/location-autocomplete';

@Component({
  selector: 'app-new-tour',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LocationAutocompleteComponent
  ],
  templateUrl: './new-tour.html',
  styleUrl: './new-tour.css',
  standalone: true
})
export class NewTourComponent {
  toursStore = inject(ToursStore)
  activeTourStore = inject(ActiveTourStore)
  router = inject(Router)
  http = inject(HttpClient)

  message = signal('');
  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal<string | null>(null);
  selectedType = signal<TransportType>(null);
  selectionTarget = computed(() => this.activeTourStore.selectionTarget());

  constructor() {
    effect(() => {
      const poi = this.activeTourStore.selectedPoi();
      const target = this.activeTourStore.selectionTarget();
      if (poi && target) {
        if (target === 'from') {
          this.tourForm.patchValue({from: poi.name});
        } else if (target === 'to') {
          this.tourForm.patchValue({to: poi.name});
        }
        this.activeTourStore.selectedPoi.set(null);
        this.activeTourStore.selectionTarget.set(null);
      }
    });

    // Reactively fetch route preview geometry when form values and transport mode are completed
    effect(() => {
      const form = this.formValue();
      const mode = this.selectedType();
      if (form.from && form.to && mode) {
        this.fetchRoutePreview(form.from, form.to, mode);
      } else {
        this.activeTourStore.previewRouteGeometry.set(null);
      }
    });
  }

  toggleSelectionTarget(target: 'from' | 'to'): void {
    if (this.activeTourStore.selectionTarget() === target) {
      this.activeTourStore.selectionTarget.set(null);
    } else {
      this.activeTourStore.selectionTarget.set(target);
    }
  }

  onFromSelected(suggestion: LocationSuggestion): void {
    if (!suggestion.label) { this.tourForm.patchValue({ from: '' }); return; }
    this.tourForm.patchValue({ from: suggestion.label });
    this.activeTourStore.selectedPoi.set({ name: suggestion.label, lat: suggestion.lat, lon: suggestion.lon });
    this.activeTourStore.mapViewRequest.set({ lat: suggestion.lat, lon: suggestion.lon });
    this.activeTourStore.selectionTarget.set('from');
  }

  onToSelected(suggestion: LocationSuggestion): void {
    if (!suggestion.label) { this.tourForm.patchValue({ to: '' }); return; }
    this.tourForm.patchValue({ to: suggestion.label });
    this.activeTourStore.selectedPoi.set({ name: suggestion.label, lat: suggestion.lat, lon: suggestion.lon });
    this.activeTourStore.mapViewRequest.set({ lat: suggestion.lat, lon: suggestion.lon });
    this.activeTourStore.selectionTarget.set('to');
  }

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

  private fetchRoutePreview(from: string, to: string, mode: TransportType): void {
    const url = 'http://localhost:8080/api/routes/preview';
    const body = {
      from: from.trim(),
      to: to.trim(),
      transportType: mode
    };
    this.http.post<{ routeInformation: string }>(url, body, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res && res.routeInformation) {
            this.activeTourStore.previewRouteGeometry.set(res.routeInformation);
          }
        },
        error: (err) => {
          console.error('Failed to fetch route preview', err);
          this.activeTourStore.previewRouteGeometry.set(null);
        }
      });
  }

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
          this.activeTourStore.previewRouteGeometry.set(null); // Clear preview geometry
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
    this.activeTourStore.previewRouteGeometry.set(null); // Clear preview geometry
    this.router.navigate(['/']);
  }
}
