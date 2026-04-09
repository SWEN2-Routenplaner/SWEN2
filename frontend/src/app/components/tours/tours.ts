import {Component, inject} from '@angular/core';
import {MapComponent} from '../map/map';
import {NewTourComponent} from './tours/new-tour/new-tour';
import {SavedToursComponent} from './tours/saved-tours/saved-tours';
import {TourLogsComponent} from './tour-logs/tour-logs';
import {ActiveTourStore} from '../../states/active-tour-store';
import {TourLogsMetaStore} from './tour-logs/tour-logs-meta.store';
import {ToursMetaStore} from './tours-meta.store';
import {UpdateTourComponent} from './tours/update-tour/update-tour';

@Component({
  selector: 'app-tours',
  imports: [MapComponent, NewTourComponent, SavedToursComponent, TourLogsComponent, UpdateTourComponent],
  providers: [ToursMetaStore],
  templateUrl: './tours.html',
  styleUrl: './tours.css',
  standalone: true
})
export class ToursComponent{
  activeTourStore = inject(ActiveTourStore);
  toursStore = inject(ActiveTourStore);
  tourLogsStore = inject(TourLogsMetaStore);
  toursMetaStore = inject(ToursMetaStore);

}
