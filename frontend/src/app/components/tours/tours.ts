import {Component, inject} from '@angular/core';
import {MapComponent} from '../map/map';
import {NewTourComponent} from './new-tour/new-tour';
import {SavedToursComponent} from './saved-tours/saved-tours';
import {TourLogsComponent} from '../tour-logs/tour-logs';
import {ActiveTourStore} from '../../states/active-tour-store';
import {TourLogsStore} from '../../states/tour-logs-store';
import {ToursMetaStore} from './tours-meta-store';

@Component({
  selector: 'app-tours',
  imports: [MapComponent, NewTourComponent, SavedToursComponent, TourLogsComponent],
  providers: [ToursMetaStore],
  templateUrl: './tours.html',
  styleUrl: './tours.css',
  standalone: true
})
export class ToursComponent{
  activeTourStore = inject(ActiveTourStore);
  toursStore = inject(ActiveTourStore);
  tourLogsStore = inject(TourLogsStore);
  toursMetaStore = inject(ToursMetaStore);

}
