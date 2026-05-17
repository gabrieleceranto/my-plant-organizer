export type HealthStatus = 'ok' | 'warn' | 'bad';

export interface Plant {
  id: number;
  name: string;
  latin: string;
  category: string;
  note: string;
  health: HealthStatus;
  image_path: string;
}
