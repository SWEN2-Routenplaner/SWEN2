import {Injectable, computed, signal, model} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TourLogsStore {
  // Original states (Model)
  readonly showLogs = signal(false);

  // Derived states (View Model/Computed)
  readonly showLogs$ = computed(() => this.showLogs());
}
