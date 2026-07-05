import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TourItemComponent } from './tour-item';
import { ToursStore } from '../../../../../states/tours.store';
import { ActiveTourStore } from '../../../../../states/active-tour-store';
import { TourLogsStore } from '../../../../../states/tour-logs.store';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Tour } from '../../../../../models/tour.model';
import { TourLog } from '../../../../../models/tour-log.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TourItemComponent', () => {
  let component: TourItemComponent;
  let fixture: ComponentFixture<TourItemComponent>;
  let mockTourLogsStore: any;
  let mockToursStore: any;
  let mockRouter: any;

  const mockTour: Tour = {
    id: 1,
    name: 'Test Tour',
    description: 'A test tour',
    from: 'A',
    to: 'B',
    transportType: 'CAR',
    distance: 10,
    estimatedDuration: 15,
    routeInformation: 'geom'
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn()
    };
    mockToursStore = {
      getTourById: vi.fn().mockReturnValue(mockTour),
      deleteTour: vi.fn()
    };
    mockTourLogsStore = {
      getLogsByTourId: vi.fn().mockReturnValue([]),
      loadLogs: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TourItemComponent
      ],
      providers: [
        ActiveTourStore,
        { provide: ToursStore, useValue: mockToursStore },
        { provide: TourLogsStore, useValue: mockTourLogsStore },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TourItemComponent);
    component = fixture.componentInstance;
    component.tour = mockTour;
    fixture.detectChanges();
  });

  it('should evaluate popularity as low (😔) when there are less than 5 logs', () => {
    // Return 3 logs
    const mockLogs: Partial<TourLog>[] = [{}, {}, {}];
    mockTourLogsStore.getLogsByTourId.mockReturnValue(mockLogs);

    expect(component.calculatePopularity(1)).toBe('😔');
  });

  it('should evaluate popularity as medium (😐) when there are 5 to 9 logs', () => {
    // Return 6 logs
    const mockLogs: Partial<TourLog>[] = [{}, {}, {}, {}, {}, {}];
    mockTourLogsStore.getLogsByTourId.mockReturnValue(mockLogs);

    expect(component.calculatePopularity(1)).toBe('😐');
  });

  it('should evaluate popularity as high (😁) when there are 10 or more logs', () => {
    // Return 10 logs
    const mockLogs: Partial<TourLog>[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    mockTourLogsStore.getLogsByTourId.mockReturnValue(mockLogs);

    expect(component.calculatePopularity(1)).toBe('😁');
  });
});
