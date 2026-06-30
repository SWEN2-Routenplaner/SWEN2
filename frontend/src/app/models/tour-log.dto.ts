export interface TourLogCreateRequest {
  dateTime: string;
  comment?: string;
  difficulty: number;
  totalDistance: number;
  totalTime: number;
  rating: number;
}

export interface TourLogUpdateRequest extends TourLogCreateRequest {}
