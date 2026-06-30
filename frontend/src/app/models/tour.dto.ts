import { TransportType } from './tour.model';

export interface TourCreateRequest {
  name: string;
  description?: string;
  from: string;
  to: string;
  transportType: Exclude<TransportType, null>;
}


export interface TourUpdateRequest extends TourCreateRequest {}
