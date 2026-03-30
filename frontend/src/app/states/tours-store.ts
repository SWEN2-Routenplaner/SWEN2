import {Injectable, computed, signal, model} from '@angular/core';
import {Tour} from './models/tour.model';

@Injectable({providedIn: 'root'})
export class ToursStore {
  // Mock Tours
  tours: Tour[] = [];

  // Original states (Model)

  //Derived states (View Model/Computed)

}
