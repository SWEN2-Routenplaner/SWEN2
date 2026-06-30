export type TransportMode = 'CAR' | 'BIKE' | 'WALK' | null;

export type Tour = {
  id: number;
  from: string;
  transportMode: TransportMode;
  to: string;
  name: string;
  description: string;
}
