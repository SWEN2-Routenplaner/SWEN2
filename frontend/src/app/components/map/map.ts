import { Component } from '@angular/core';
import * as L from 'leaflet';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'map',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
  standalone: true
})
export class MapComponent {
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngExpression = [48.2082, 16.3725];
  private readonly defaultZoom = 13;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    // 1. Initialize the map object without initial view options, we will set them with offset below
    this.map = L.map('map', {
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
      this.moveTo(this.defaultCenter, this.defaultZoom, false);
    }, 200);
  }

  private getVisualCenterPoint(): L.Point {
    if (!this.map) {
      return L.point(0, 0);
    }
    const size = this.map.getSize();
    const width = size.x;
    const height = size.y;

    // Check if sidebar is visible (screen width > 768px for desktop layout)
    const isDesktop = window.innerWidth > 768;

    if (isDesktop) {
      // Sidebar width is 400px, margin left is 10px, margin right is 10px
      // Total offset on the left side is 420px
      const sidebarOffset = 420;
      const visualWidth = width - sidebarOffset;
      const x = sidebarOffset + visualWidth / 2;
      const y = height / 2;
      return L.point(x, y);
    } else {
      // On mobile, the sidebar is hidden/not visible, so visual center is container center
      return L.point(width / 2, height / 2);
    }
  }

  public moveTo(latlng: L.LatLngExpression, zoom: number, animate = true): void {
    if (!this.map) return;

    const targetLatLng = L.latLng(latlng);
    const size = this.map.getSize();
    const visualCenter = this.getVisualCenterPoint();

    // 1. Project target coordinate to pixel space at target zoom level
    const targetProjected = this.map.project(targetLatLng, zoom);
    
    // 2. Adjust target projected pixel coordinates by visual center offsets
    const dx = visualCenter.x - size.x / 2;
    const dy = visualCenter.y - size.y / 2;
    const offsetProjected = L.point(targetProjected.x - dx, targetProjected.y - dy);

    // 3. Unproject offset pixel coordinate back to geographical LatLng coordinate
    const offsetLatLng = this.map.unproject(offsetProjected, zoom);

    // 4. Set map view: snap instantly or fly smoothly with ease-in-out timing
    if (animate) {
      this.map.flyTo(offsetLatLng, zoom, {
        animate: true,
        duration: 0.8 // Snappier flight transition with smooth ease-in-out
      });
    } else {
      this.map.setView(offsetLatLng, zoom, { animate: false });
    }
  }

  zoomIn() {
    if (!this.map) return;
    const currentZoom = this.map.getZoom();
    const targetZoom = currentZoom + 1;
    if (targetZoom <= this.map.getMaxZoom()) {
      this.map.setZoomAround(this.getVisualCenterPoint(), targetZoom);
    }
  }

  zoomOut() {
    if (!this.map) return;
    const currentZoom = this.map.getZoom();
    const targetZoom = currentZoom - 1;
    if (targetZoom >= this.map.getMinZoom()) {
      this.map.setZoomAround(this.getVisualCenterPoint(), targetZoom);
    }
  }

  centerMap() {
    this.moveTo(this.defaultCenter, this.defaultZoom);
  }

  ngOnDestroy(): void {
    // Clean up to prevent memory leaks
    if (this.map) {
      this.map.remove();
    }
  }
}
