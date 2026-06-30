export type TransportType = 'CAR' | 'BIKE' | 'WALK' | null;

export type Tour = {
  id: number;
  from: string;
  TransportType: TransportType;
  to: string;
  name: string;
  description: string;
  distance: number;
  estimatedDuration: number;
  routeInformation: string;
}
