export enum Difficulty { Easy= 1, Medium =2, Hard =3 }

export enum Rating {
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  VERY_GOOD = 4,
  EXCELLENT = 5
}

export type TourLog = {
  id: number;
  tourId: number;
  date: Date;
  comment: string;
  difficulty: Difficulty;
  totalDistance: number;
  totalTime: number;
  rating: Rating;
}
