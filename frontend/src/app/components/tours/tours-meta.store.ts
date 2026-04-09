import {Injectable, signal} from '@angular/core';

// Dies when component dies (no providedIn: 'root')
@Injectable()
export class ToursMetaStore {
  readonly selectedSite = signal<string>("default");
  readonly selectedId = signal<number| null>(null);

  setSelectedSite(site: string): void {
    this.selectedSite.set(site);
  }
  setSelectedId(id: number| null): void {
    this.selectedId.set(id);
  }
}
