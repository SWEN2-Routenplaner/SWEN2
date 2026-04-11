import {Component} from '@angular/core';
import {MapComponent} from '../map/map';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-tours',
  imports: [MapComponent, RouterOutlet],
  providers: [],
  templateUrl: './tours.html',
  styleUrl: './tours.css',
  standalone: true
})
export class ToursComponent{
}
