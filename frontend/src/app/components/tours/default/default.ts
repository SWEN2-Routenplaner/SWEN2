import { Component } from '@angular/core';
import {NewTourComponent} from './new-tour/new-tour';
import {SavedToursComponent} from './saved-tours/saved-tours';

@Component({
  selector: 'app-default',
  imports: [
    NewTourComponent,
    SavedToursComponent
  ],
  templateUrl: './default.html',
  styleUrl: './default.css',
  standalone: true
})
export class DefaultComponent {

}
