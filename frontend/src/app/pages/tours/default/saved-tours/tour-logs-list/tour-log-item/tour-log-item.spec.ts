import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TourLogItemComponent } from './tour-log-item';
import { TourLogsStore } from '../../../../../../states/tour-logs.store';
import { Router } from '@angular/router';
import { TourLog } from '../../../../../../models/tour-log.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TourLogItemComponent', () => {
  let component: TourLogItemComponent;
  let fixture: ComponentFixture<TourLogItemComponent>;
  let mockRouter: any;
  let mockTourLogsStore: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn()
    };
    mockTourLogsStore = {
      deleteTourLog: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TourLogItemComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TourLogsStore, useValue: mockTourLogsStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TourLogItemComponent);
    component = fixture.componentInstance;
  });

  it('should evaluate a log as child-friendly when easy, short distance, and short duration', () => {
    const log: TourLog = {
      id: 1,
      tourId: 1,
      dateTime: '2026-07-04T12:00:00Z',
      comment: 'Nice short walk',
      difficulty: 1, // Easy
      totalDistance: 3.5, // < 5km
      totalTime: 45, // < 120 mins
      rating: 5
    };

    expect(component.isChildFriendly(log)).toBe(true);
  });

  it('should evaluate as NOT child-friendly when distance is 5km or more', () => {
    const log: TourLog = {
      id: 2,
      tourId: 1,
      dateTime: '2026-07-04T12:00:00Z',
      comment: 'Long easy walk',
      difficulty: 1,
      totalDistance: 5.0, // >= 5km
      totalTime: 90,
      rating: 4
    };

    expect(component.isChildFriendly(log)).toBe(false);
  });

  it('should evaluate as NOT child-friendly when difficulty is not easy', () => {
    const log: TourLog = {
      id: 3,
      tourId: 1,
      dateTime: '2026-07-04T12:00:00Z',
      comment: 'Short but steep climb',
      difficulty: 2, // Medium
      totalDistance: 2.0,
      totalTime: 50,
      rating: 3
    };

    expect(component.isChildFriendly(log)).toBe(false);
  });

  it('should evaluate as NOT child-friendly when duration is 120 minutes or more', () => {
    const log: TourLog = {
      id: 4,
      tourId: 1,
      dateTime: '2026-07-04T12:00:00Z',
      comment: 'A 2-hour slow stroll',
      difficulty: 1,
      totalDistance: 4.0,
      totalTime: 120, // >= 120 mins
      rating: 4
    };

    expect(component.isChildFriendly(log)).toBe(false);
  });
});
