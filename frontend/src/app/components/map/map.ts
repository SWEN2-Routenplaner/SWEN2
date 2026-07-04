import { Component, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import * as L from 'leaflet';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { ActiveTourStore } from '../../states/active-tour-store';

@Component({
  selector: 'map',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
  standalone: true
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngExpression = [48.2082, 16.3725];
  private readonly defaultZoom = 12;

  // OpenRouteService API Key (hardcoded directly in the frontend for this test)
  private readonly ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMyZjk5MTUxNWMxNjQ3YWY4MDNlMjYzNGZkY2EzOTcxIiwiaCI6Im11cm11cjY0In0=';

  private http = inject(HttpClient);
  public activeTourStore = inject(ActiveTourStore);

  private clickMarker: L.Marker | undefined;
  private townLabelsLayerGroup: L.LayerGroup | undefined;
  private routePolyline: L.Polyline | undefined;

  constructor() {
    // Reactively draw route previews or active saved routes on the map
    effect(() => {
      const previewGeom = this.activeTourStore.previewRouteGeometry();
      if (previewGeom) {
        const coords = this.decodePolyline(previewGeom);
        this.drawRoute(coords);
        return;
      }

      const active = this.activeTourStore.activeTour();
      if (active && active.routeInformation) {
        const coords = this.decodePolyline(active.routeInformation);
        this.drawRoute(coords);
      } else {
        this.drawRoute(null);
      }
    });

    // Reactively fly to a coordinate when a search viewport request occurs
    effect(() => {
      const req = this.activeTourStore.mapViewRequest();
      if (!req || !this.map) return;

      this.map.flyTo(L.latLng(req.lat, req.lon), 14);

      // Place a temporary marker on the searched point
      const searchIcon = L.divIcon({
        html: `<div style="background-color: #e91e63; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
        className: 'custom-search-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      if (this.clickMarker) {
        this.clickMarker.setLatLng([req.lat, req.lon]);
      } else {
        this.clickMarker = L.marker([req.lat, req.lon], { icon: searchIcon }).addTo(this.map);
      }

      // Reset the request to clear state
      setTimeout(() => {
        this.activeTourStore.mapViewRequest.set(null);
      }, 0);
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    // 1. Initialize the map object with default view to setup projection
    this.map = L.map('map', {
      zoomControl: false // Disable default zoom control
    }).setView(this.defaultCenter, this.defaultZoom);

    // 2. Add a Tile Layer (CartoDB Positron No Labels for a clean base map)
    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, © CARTO',
      zoomOffset: 0,
      tileSize: 256,
      detectRetina: true
    });

    tiles.addTo(this.map);

    // Initialize LayerGroup for town/village labels
    this.townLabelsLayerGroup = L.layerGroup().addTo(this.map);

    // 3. Register click handler to capture arbitrary coordinates
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // 4. Register moveend handler to fetch visible cities/villages dynamically
    this.map.on('moveend', () => {
      this.fetchTownsForVisibleMap();
    });

    // 5. On zoom changes, immediately hide labels that no longer belong at the current zoom
    this.map.on('zoomend', () => {
      this.filterLabelsByZoom();
    });

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

  // Fetch cities/towns/villages inside the current bounding box directly from the French Overpass API mirror
  private fetchTownsForVisibleMap(): void {
    if (!this.map || !this.townLabelsLayerGroup) return;

    const zoom = this.map.getZoom();
    // Only load labels at zoom levels where places are relevant
    if (zoom < 4) {
      this.townLabelsLayerGroup.clearLayers();
      return;
    }

    const bounds = this.map.getBounds();
    const minLon = bounds.getWest();
    const minLat = bounds.getSouth();
    const maxLon = bounds.getEast();
    const maxLat = bounds.getNorth();

    // Determine place types and Overpass query based on zoom detail (using anchored regex to exclude blocks/townships)
    let query = '';
    if (zoom >= 4 && zoom < 6) {
      // Only countries
      query = `node["place"="country"](${minLat},${minLon},${maxLat},${maxLon});`;
    } else if (zoom >= 6 && zoom < 8) {
      // Countries and major cities (capitals)
      query = `node["place"="country"](${minLat},${minLon},${maxLat},${maxLon});
               node["place"="city"]["capital"="yes"](${minLat},${minLon},${maxLat},${maxLon});`;
    } else if (zoom >= 8 && zoom < 10) {
      // Only cities
      query = `node["place"="city"](${minLat},${minLon},${maxLat},${maxLon});`;
    } else if (zoom >= 10 && zoom < 12) {
      // Cities and large towns (anchored regex)
      query = `node["place"~"^(city|town)$"](${minLat},${minLon},${maxLat},${maxLon});`;
    } else if (zoom >= 12 && zoom < 14) {
      // Cities, towns, and villages (anchored regex)
      query = `node["place"~"^(city|town|village)$"](${minLat},${minLon},${maxLat},${maxLon});`;
    } else {
      // Zoom >= 14: include suburbs (anchored regex)
      query = `node["place"~"^(city|town|village|suburb)$"](${minLat},${minLon},${maxLat},${maxLon});`;
    }

    // Call the French mirror directly from the browser (CORS-enabled and allowed on your network)
    const url = `https://overpass.openstreetmap.fr/api/interpreter?data=[out:json];(${query});out;`;

    this.http.get<any>(url)
      .subscribe({
        next: (data) => {
          if (data && data.elements) {
            this.renderTownLabels(data.elements);
          }
        },
        error: (err) => {
          console.error('Failed to fetch places directly from French Overpass mirror', err);
        }
      });
  }

  // Render clickable text labels on top of the clean map
  private renderTownLabels(elements: any[]): void {
    if (!this.map || !this.townLabelsLayerGroup) return;

    this.townLabelsLayerGroup.clearLayers();

    elements.forEach((el) => {
      if (!el.tags || !el.tags.name) return;

      const name = el.tags.name;
      const place = el.tags.place;
      const lat = el.lat;
      const lon = el.lon;

      let styleClass = 'town-label-city';
      if (place === 'country') styleClass = 'town-label-country';
      else if (place === 'town') styleClass = 'town-label-town';
      else if (place === 'village') styleClass = 'town-label-village';
      else if (place === 'suburb') styleClass = 'town-label-suburb';

      // Create a centered HTML text label using Leaflet divIcon (0x0 size for perfect CSS centering)
      const labelIcon = L.divIcon({
        html: `<div class="interactive-map-label ${styleClass}">${name}</div>`,
        className: 'custom-town-label-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([lat, lon], { icon: labelIcon });

      // Store the place type on the marker for zoom-based filtering
      (marker as any)._placeType = place;

      // Click event selects the town name directly
      marker.on('click', () => {
        const target = this.activeTourStore.selectionTarget();
        if (target) {
          this.selectLocation(name, lon, lat);
        }
      });

      this.townLabelsLayerGroup?.addLayer(marker);
    });

    // Apply zoom filter immediately after rendering
    this.filterLabelsByZoom();
  }

  // Determine which place types are visible at the current zoom level
  private getAllowedPlaceTypes(zoom: number): Set<string> {
    if (zoom < 4) return new Set();
    if (zoom < 6) return new Set(['country']);
    if (zoom < 8) return new Set(['country', 'city']);
    if (zoom < 10) return new Set(['city']);
    if (zoom < 12) return new Set(['city', 'town']);
    if (zoom < 14) return new Set(['city', 'town', 'village']);
    return new Set(['city', 'town', 'village', 'suburb']);
  }

  // Hide/show existing label markers based on the current zoom level
  private filterLabelsByZoom(): void {
    if (!this.map || !this.townLabelsLayerGroup) return;

    const zoom = this.map.getZoom();
    const allowed = this.getAllowedPlaceTypes(zoom);

    // Collect layers to remove (cannot mutate while iterating)
    const toRemove: L.Layer[] = [];
    this.townLabelsLayerGroup.eachLayer((layer) => {
      const placeType = (layer as any)._placeType as string | undefined;
      if (placeType && !allowed.has(placeType)) {
        toRemove.push(layer);
      }
    });

    toRemove.forEach(layer => this.townLabelsLayerGroup!.removeLayer(layer));
  }

  // Handle arbitrary map click events directly via public OpenRouteService reverse geocoding API
  private onMapClick(lat: number, lng: number): void {
    if (!this.map) return;

    const target = this.activeTourStore.selectionTarget();
    if (!target) return;

    // 1. Place a blue pin indicator to show where the user clicked
    const clickIcon = L.divIcon({
      html: `<div style="background-color: #2196f3; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
      className: 'custom-click-marker',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    if (this.clickMarker) {
      this.clickMarker.setLatLng([lat, lng]);
    } else {
      this.clickMarker = L.marker([lat, lng], { icon: clickIcon }).addTo(this.map);
    }

    // 2. Call public OpenRouteService API directly from the browser
    const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${this.ORS_API_KEY}&point.lon=${lng}&point.lat=${lat}&layers=locality,localadmin,borough,coarse&size=1`;
    this.http.get<any>(url)
      .subscribe({
        next: (response) => {
          let locationName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          if (response && response.features && response.features.length > 0) {
            const props = response.features[0].properties;
            if (props) {
              locationName = props.locality || props.village || props.borough || props.county || props.name || props.label || locationName;
            }
          }
          this.selectLocation(locationName, lng, lat);
        },
        error: (err) => {
          console.error('Failed to reverse geocode clicked point directly via ORS', err);
          this.selectLocation(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lng, lat);
        }
      });
  }

  // Set the selected location in the store and clear selection marker
  private selectLocation(name: string, lon: number, lat: number): void {
    this.activeTourStore.selectedPoi.set({
      name: name,
      lon: lon,
      lat: lat
    });
    
    // Clear marker
    if (this.clickMarker) {
      this.clickMarker.remove();
      this.clickMarker = undefined;
    }
  }

  // Public method called to abort selection mode
  public cancelSelection(): void {
    this.activeTourStore.selectionTarget.set(null);
    if (this.clickMarker) {
      this.clickMarker.remove();
      this.clickMarker = undefined;
    }
  }

  // Draw the route coordinates as a polyline on the Leaflet map and fit camera bounds
  private drawRoute(coords: L.LatLngExpression[] | null): void {
    if (this.routePolyline) {
      this.routePolyline.remove();
      this.routePolyline = undefined;
    }

    if (!this.map || !coords || coords.length === 0) return;

    this.routePolyline = L.polyline(coords, {
      color: '#2196f3',
      weight: 6,
      opacity: 0.8,
      lineJoin: 'round'
    }).addTo(this.map);

    try {
      this.map.fitBounds(this.routePolyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 15,
        animate: true
      });
    } catch (e) {
      console.warn('Failed to fit bounds to route coordinates', e);
    }
  }

  // Helper method to decode Google Polyline encoded format into LatLng coordinate tuples
  private decodePolyline(encoded: string): L.LatLngExpression[] {
    if (!encoded || encoded.startsWith('PLACEHOLDER')) {
      return [];
    }
    const poly: L.LatLngExpression[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push([lat / 1e5, lng / 1e5]);
    }
    return poly;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
