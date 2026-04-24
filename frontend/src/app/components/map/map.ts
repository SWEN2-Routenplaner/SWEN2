import { Component } from '@angular/core';
import * as L from 'leaflet';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'map',
  imports: [MatIconModule, MatButtonModule, MatButtonToggleModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
  standalone: true
})
export class MapComponent {
  private map: L.Map | undefined;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    // 1. Initialize the map object
    this.map = L.map('map', {
      center: [51.505, -0.09], // Latitude, Longitude
      zoom: 13,
      zoomControl: false // Disable default zoom control
    });

    // 2. Add a Tile Layer (OpenStreetMap is the standard free choice)
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      zoomOffset: 0,
      tileSize: 256,
      detectRetina: true
    });

    tiles.addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  centerMap() {
    // Logic for centering will be added here
    console.log('Center map clicked');
  }

  ngOnDestroy(): void {
    // Clean up to prevent memory leaks
    if (this.map) {
      this.map.remove();
    }
  }
}
