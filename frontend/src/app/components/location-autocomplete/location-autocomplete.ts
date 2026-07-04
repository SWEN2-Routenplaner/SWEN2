import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface LocationSuggestion {
  label: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-location-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [formControl]="inputControl"
        [placeholder]="placeholder"
        [matAutocomplete]="auto"
        (focus)="onFocus()"
      />
      <button mat-icon-button matSuffix (click)="clear(); $event.stopPropagation()" type="button" title="Clear">
        <mat-icon>close</mat-icon>
      </button>
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onOptionSelected($event.option.value)">
        @for (suggestion of suggestions(); track suggestion.label) {
          <mat-option [value]="suggestion">
            <mat-icon style="font-size:16px;width:16px;height:16px;line-height:16px;vertical-align:middle;margin-right:8px;color:#64748b">place</mat-icon>
            {{ suggestion.label }}
          </mat-option>
        }
        @if (loading() && inputControl.value?.length >= 2) {
          <mat-option disabled>
            <span style="color:#64748b;font-size:0.85rem">Searching…</span>
          </mat-option>
        }
        @if (!loading() && suggestions().length === 0 && inputControl.value?.length >= 2) {
          <mat-option disabled>
            <span style="color:#64748b;font-size:0.85rem">No results found</span>
          </mat-option>
        }
      </mat-autocomplete>
      <ng-content select="mat-error"></ng-content>
    </mat-form-field>
  `,
  styles: [`
    :host { display: block; }
    .full-width { width: 100%; }
  `]
})
export class LocationAutocompleteComponent implements OnInit, OnDestroy {
  @Input() label = 'Location';
  @Input() placeholder = 'Search for a location';
  @Input() inputControl = new FormControl('');
  @Output() locationSelected = new EventEmitter<LocationSuggestion>();
  @Output() focused = new EventEmitter<void>();

  private readonly ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMyZjk5MTUxNWMxNjQ3YWY4MDNlMjYzNGZkY2EzOTcxIiwiaCI6Im11cm11cjY0In0=';
  private http = inject(HttpClient);

  suggestions = signal<LocationSuggestion[]>([]);
  loading = signal(false);

  private inputSubject = new Subject<string>();
  private sub: Subscription | undefined;

  ngOnInit(): void {
    this.sub = this.inputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => {
        const query = typeof val === 'string' ? val : (val as any)?.label ?? '';
        if (query.length < 2) {
          this.suggestions.set([]);
          return of(null);
        }
        this.loading.set(true);
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${this.ORS_API_KEY}&text=${encodeURIComponent(query)}&size=6`;
        return this.http.get<any>(url).pipe(catchError(() => of(null)));
      })
    ).subscribe(res => {
      this.loading.set(false);
      if (!res || !res.features) { this.suggestions.set([]); return; }
      this.suggestions.set(
        res.features.map((f: any) => ({
          label: f.properties.label,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        }))
      );
    });
  }

  displayFn(suggestion: LocationSuggestion | string): string {
    if (!suggestion) return '';
    return typeof suggestion === 'string' ? suggestion : suggestion.label;
  }

  onOptionSelected(suggestion: LocationSuggestion): void {
    this.locationSelected.emit(suggestion);
  }

  onFocus(): void {
    this.focused.emit();
  }

  clear(): void {
    this.inputControl.setValue('');
    this.suggestions.set([]);
    this.locationSelected.emit({ label: '', lat: 0, lon: 0 });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
