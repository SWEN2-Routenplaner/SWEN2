// update-tour.ts
import {Component, inject, OnInit, signal, effect, computed} from '@angular/core';
import {ToursStore} from '../../../states/tours.store';
import {ActiveTourStore} from '../../../states/active-tour-store';
import {Tour, TransportType} from '../../../models/tour.model';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {HttpClient} from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TourUpdateRequest} from '../../../models/tour.dto';
import {
  LocationAutocompleteComponent,
  LocationSuggestion
} from '../../../components/location-autocomplete/location-autocomplete';

@Component({
  selector: 'app-update-tour',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LocationAutocompleteComponent
  ],
  templateUrl: './update-tour.html',
  styleUrl: './update-tour.css',
})
export class UpdateTourComponent {
  toursStore = inject(ToursStore);
  activeTourStore = inject(ActiveTourStore);
  errors = signal<string[]>([]);
  corrects = signal<string[]>([]);
  message = signal<string>('');
  saveError = signal<string | null>(null);
  router = inject(Router);
  http = inject(HttpClient);
  saving = signal(false);
  saveSuccess = signal(false);
  confirmDelete = signal(false);
  id: number | null = null;
  selectionTarget = computed(() => this.activeTourStore.selectionTarget());

  tourForm = new FormGroup({
    from: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    to: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    TransportType: new FormControl<string | null>('', {validators: [Validators.required], nonNullable: true}),
    name: new FormControl('', {validators: [Validators.required], nonNullable: true}),
    description: new FormControl(''),
  })

  private formValue = toSignal(this.tourForm.valueChanges, {initialValue: this.tourForm.value});

  // Load Selected Tour on init
  constructor(route: ActivatedRoute) {
    this.id = Number(route.snapshot.params['id']);
    if (this.id) {
      // Trigger async load
      this.toursStore.getTourById(this.id);
    }

    // Reactively populate the form once the tour is loaded in the store
    effect(() => {
      if (this.id) {
        const activeTour = this.toursStore.allTours().find(t => t.id === this.id);
        if (activeTour) {
          this.tourForm.patchValue({
            from: activeTour.from,
            to: activeTour.to,
            TransportType: activeTour.transportType,
            name: activeTour.name,
            description: activeTour.description,
          });
          this.selectedMode.set(activeTour.transportType);
        }
      }
    });

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
      const mode = this.selectedMode();
      if (form.from && form.to && mode) {
        this.fetchRoutePreview(form.from, form.to, mode as TransportType);
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

  // UI variables
  selectedMode = signal<string | null>('');

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
    if (this.selectedMode() === mode) {
      this.selectedMode.set(null);
      this.tourForm.patchValue({TransportType: null});
    } else {
      this.selectedMode.set(mode);
      this.tourForm.patchValue({TransportType: mode});
    }
  }

  saveTour() {
    this.setErrorsAndCorrects();
    if (this.tourForm.valid && !this.saving() && !this.saveSuccess()) {
      const id: number | null = this.id;
      if (!id) {
        console.error("Tour not found");
        return;
      }

      this.saving.set(true);
      this.saveError.set(null);

      const rawData = this.tourForm.getRawValue();
      const body: TourUpdateRequest = {
        from: rawData.from,
        to: rawData.to,
        transportType: this.selectedMode() as Exclude<TransportType, null>,
        name: rawData.name,
        description: rawData.description ?? '',
      };

      this.toursStore.updateTour(id, body).subscribe({
        next: (updated) => {
          const currentActive = this.activeTourStore.activeTour();
          if (currentActive?.id === id) {
            this.activeTourStore.activeTour.set(updated);
          }
          this.activeTourStore.previewRouteGeometry.set(null); // Clear preview geometry

          this.saving.set(false);
          this.saveSuccess.set(true);

          setTimeout(() => {
            this.router.navigate(['']);
          }, 800);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Failed to save tour. Please try again.');
        }
      });
    }
  }

  // sets errors and corrects arrays based on form validity
  setErrorsAndCorrects() {
    this.errors.set([]); // first clear errors
    this.corrects.set([]);
    const controls = this.tourForm.controls;
    if (controls.from.invalid) {
      this.errors().push('from')
    } else {
      this.corrects().push('from')
    }
    if (controls.to.invalid) {
      this.errors().push('to')
    } else {
      this.corrects().push('to')
    }
    if (controls.TransportType.invalid) {
      this.errors().push('TransportType');
    } else {
      this.corrects().push('TransportType');
    }
    if (controls.name.invalid) {
      this.errors().push('name')
    } else {
      this.corrects().push('name')
    }

    this.corrects().push('description'); // always correct description (even empty)
  }

  triggerDelete() {
    this.confirmDelete.set(true);
  }

  cancelDelete() {
    this.confirmDelete.set(false);
  }

  deleteTour() {
    if (this.id) {
      this.toursStore.deleteTour(this.id).subscribe({
        next: () => {
          const currentActive = this.activeTourStore.activeTour();
          if (currentActive?.id === this.id) {
            this.activeTourStore.activeTour.set(null);
          }
          this.activeTourStore.previewRouteGeometry.set(null); // Clear preview geometry
          this.router.navigate(['']);
        },
        error: () => {
          this.saveError.set('Failed to delete tour. Please try again.');
          this.confirmDelete.set(false);
        }
      });
    }
  }

  back() {
    this.activeTourStore.previewRouteGeometry.set(null); // Clear preview geometry
    this.router.navigate(['']);
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
}
