import {AfterViewInit, Component, HostListener, signal, ViewChild} from '@angular/core';
import {MapComponent} from '../../components/map/map';
import {RouterOutlet} from '@angular/router';
import {MatCard} from '@angular/material/card';
import {IonContent, IonModal} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tours',
  imports: [MapComponent, RouterOutlet, MatCard, IonModal, IonContent],
  templateUrl: './tours.html',
  styleUrl: './tours.css',
  standalone: true
})
export class ToursPage implements AfterViewInit {
  @ViewChild(IonModal) modal!: IonModal;
  isModalOpen = signal(false);

  readonly breakpoints = [0, 0.25, 0.5, 0.8];
  readonly initialBreakpoint = 0.25;

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768) this.isModalOpen.set(false); else this.isModalOpen.set(true);
  }

  ngAfterViewInit() {
    if (window.innerWidth <= 768) {
      this.forceInitAndOpen();
    }
  }

  private forceInitAndOpen() {
    // Small delay to ensure ViewChild is populated
    setTimeout(() => {
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
}
