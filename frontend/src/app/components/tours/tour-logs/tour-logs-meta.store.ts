import {Injectable, computed, signal, model} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TourLogsMetaStore {
  // Original states (Model)
  readonly selectedLogId =  signal<number | null>(null);
  readonly mode = signal<'view' | 'edit' | 'new'>('view');

  setSelectedLogId(id: number | null): void {
    this.selectedLogId.set(id);
  }
  setMode(mode: 'view' | 'edit' | 'new'): void {
    this.mode.set(mode);
  }

}
