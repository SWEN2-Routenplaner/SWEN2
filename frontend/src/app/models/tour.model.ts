export type TransportMode = 'car' | 'bike' | 'walk' | null;

export type Tour = {
  id: number;
  from: string;
  transportMode: TransportMode;
  to: string;
  name: string;
  description: string;
  intermediateStops: string[];
}
