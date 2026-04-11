import { Routes } from '@angular/router';
import {ToursComponent} from './components/tours/tours';
import {HomeComponent} from './components/home/home';
import {LoginComponent} from './components/login/login';
import {RegisterComponent} from './components/register/register';
import {ProfileComponent} from './components/profile/profile';
import {TourLogsComponent} from './components/tours/tour-logs/tour-logs';
import {UpdateTourComponent} from './components/tours/edit-tour/edit-tour';
import {DefaultComponent} from './components/tours/default/default';
import {UpdateTourLogComponent} from './components/tours/tour-logs/update-tour-log/update-tour-log';
import {SavedTourLogs} from './components/tours/tour-logs/saved-tour-logs/saved-tour-logs';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'profile', component: ProfileComponent},
  {path: 'home', component: HomeComponent},
  {
    path: 'tours',
    component: ToursComponent,
    children: [
      { path: '', component: DefaultComponent },
      { path: 'edit/:id', component: UpdateTourComponent },
      { path: 'tourlogs', component: TourLogsComponent,
        children: [
          { path: ':id', component: SavedTourLogs },
          { path: 'edit/:id', component: UpdateTourLogComponent },
      ]}
      ]
  },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: '**', redirectTo: 'home'}
];
