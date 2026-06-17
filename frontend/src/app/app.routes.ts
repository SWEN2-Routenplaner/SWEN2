import { Routes } from '@angular/router';
import {ToursPage} from './pages/tours/tours';
import {TourLogsComponent} from './pages/tours/tour-logs/tour-logs';
import {DefaultComponent} from './pages/tours/default/default';
import {UpdateTourLogComponent} from './pages/tours/tour-logs/update-tour-log/update-tour-log';
import {SavedTourLogs} from './pages/tours/tour-logs/saved-tour-logs/saved-tour-logs';
import {UpdateTourComponent} from './pages/tours/update-tour/update-tour';

export const routes: Routes = [
  {
    path: '', component: ToursPage,
    children: [
      { path: '', component: DefaultComponent },
      { path: 'edit/:id', component: UpdateTourComponent},
      { path: 'tourlogs', component: TourLogsComponent,
        children: [
          { path: ':id', component: SavedTourLogs },
          { path: 'edit/:logId', component: UpdateTourLogComponent },
          { path: 'create/:tourId', component: UpdateTourLogComponent },
        ]}
    ]
  },
  {path: '**', redirectTo: ''}
];
