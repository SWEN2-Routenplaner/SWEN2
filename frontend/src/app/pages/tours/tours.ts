import {Component, HostListener, signal, ViewChild, inject, effect} from '@angular/core';
import {MapComponent} from '../../components/map/map';
import {RouterOutlet, Router, RouterLink} from '@angular/router';
import {MatCard} from '@angular/material/card';
import {IonContent, IonModal} from '@ionic/angular/standalone';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ActiveTourStore} from '../../states/active-tour-store';
import {AuthStore} from '../../states/auth.store';

@Component({
  selector: 'app-tours',
  imports: [MapComponent, RouterOutlet, MatCard, IonModal, IonContent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './tours.html',
  styleUrl: './tours.css',
  standalone: true
})
export class ToursPage {
  router = inject(Router);
  activeTourStore = inject(ActiveTourStore);
  authStore = inject(AuthStore);

  modal?: IonModal;
  isModalOpen = signal(false);

  @ViewChild(IonModal) set modalRef(modal: IonModal | undefined) {
    this.modal = modal;
    if (modal) {
      if (window.innerWidth <= 768) {
        this.updateBreakpoints();
        this.forceInitAndOpen();
      }
    } else {
      this.isModalOpen.set(false);
    }
  }

  constructor() {
    effect(() => {
      const active = this.activeTourStore.activeTour();
      if (active && window.innerWidth <= 768) {
        this.expandModalFully();
      }
    });
  }

  isDefaultRoute(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  goBack(): void {
    window.history.back();
  }

  getSidebarTitle(): string {
    const url = this.router.url;
    if (url === '/' || url === '') {
      return 'Tours';
    }
    if (url.includes('/create')) {
      return url.includes('/tourlogs') ? 'Create Log' : 'Create Tour';
    }
    if (url.includes('/edit/')) {
      return url.includes('/tourlogs') ? 'Edit Log' : 'Edit Tour';
    }
    if (url.includes('/tourlogs')) {
      return 'Tour Logs';
    }
    return 'Tourplanner';
  }

  breakpoints = [0.02, 0.3, 0.925];
  readonly initialBreakpoint = this.breakpoints[0];

  updateBreakpoints() {
    if (!this.modal) return;
    const h = window.innerHeight;
    // Searchbar is 40px high and has 10px top margin (bottom is at 50px).
    // Adjust to h - 50 to make the gap visually match the top margin.
    const maxB = h > 0 ? (h - 50) / h : 0.925;
    this.breakpoints = [0.02, 0.3, parseFloat(maxB.toFixed(3))];
    
    const el = (this.modal as any)?.el || (this.modal as any)?.nativeElement || this.modal;
    if (el) {
      el.breakpoints = this.breakpoints;
      if (el.breakpointsChanged) {
        el.breakpointsChanged(this.breakpoints);
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.authStore.isAuthenticated$()) {
      if (this.isModalOpen()) {
        this.isModalOpen.set(false);
      }
      return;
    }
    if (window.innerWidth > 768) {
      if (this.isModalOpen()) {
        this.isModalOpen.set(false);
        const el = (this.modal as any)?.el || (this.modal as any)?.nativeElement || this.modal;
        if (el && typeof el.dismiss === 'function') {
          el.dismiss();
        }
      }
    } else {
      this.updateBreakpoints();
      this.isModalOpen.set(true);
    }
  }

  private forceInitAndOpen() {
    // Small delay to ensure ViewChild is populated
    setTimeout(() => {
      if (!this.modal) return;
      const el = (this.modal as any)?.el;
      if (el) {
        // Manually sync properties to the native element
        el.breakpoints = this.breakpoints;
        el.initialBreakpoint = this.initialBreakpoint;

        // Force the internal Ionic watcher to run immediately
        if (el.breakpointsChanged) {
          el.breakpointsChanged(this.breakpoints);
        }

        // Open the modal now that internal state is guaranteed
        this.isModalOpen.set(true);
      }
    }, 100);
  }

  handleModalDismiss() {
    this.isModalOpen.set(false);
  }

  toggleBreakpoint() {
    if (!this.modal) return;
    const el = (this.modal as any)?.el || (this.modal as any)?.nativeElement || this.modal;
    if (el && typeof el.getCurrentBreakpoint === 'function') {
      el.getCurrentBreakpoint().then((current: number | undefined) => {
        // If collapsed or undefined, expand it; otherwise, collapse it
        if (current === undefined || current <= this.breakpoints[0] + 0.01) {
          el.setCurrentBreakpoint(this.breakpoints[1]);
        } else {
          el.setCurrentBreakpoint(this.breakpoints[0]);
        }
      });
    }
  }

  expandModalFully() {
    if (!this.modal) return;
    const el = (this.modal as any)?.el || (this.modal as any)?.nativeElement || this.modal;
    if (el && typeof el.setCurrentBreakpoint === 'function') {
      el.setCurrentBreakpoint(this.breakpoints[2]);
    }
  }
}

