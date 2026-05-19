export type HealthStatus = 'ok' | 'warn' | 'bad';

export type SynergyType = 'microclima' | 'nutrienti' | 'repellente' | 'impollinatori' | 'antisettico' | 'accumulatore' | 'strutturale' | 'etilene';

export interface PlantSynergy {
  id: number;
  synergy_type: SynergyType;
  partner_name: string;
  description: string;
  how_to_use: string;
}

export interface Plant {
  id: number;
  name: string;
  latin: string;
  category: string;
  note: string;
  health: HealthStatus;
  image_path: string;
  feedback?: string;
  plant_synergies?: PlantSynergy[];
}

export interface PlantFields {
  name: string;
  latin: string;
  category: string;
  note: string;
  health: HealthStatus;
}
