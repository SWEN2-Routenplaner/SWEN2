import {Component, inject} from '@angular/core';
import {MapComponent} from '../map/map';
import {NewTourComponent} from './default/new-tour/new-tour';
import {SavedToursComponent} from './default/saved-tours/saved-tours';
import {TourLogsComponent} from './tour-logs/tour-logs';
import {ActiveTourStore} from '../../states/active-tour-store';
import {TourLogsStore} from '../../states/tour-logs-store';
import {ToursMetaStore} from './tours-meta-store';
import {UpdateTourComponent} from './update-tour/update-tour';
import {Default} from './default/default';

@Component({
  selector: 'app-tours',
  imports: [MapComponent, NewTourComponent, SavedToursComponent, TourLogsComponent, UpdateTourComponent, Default],
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
