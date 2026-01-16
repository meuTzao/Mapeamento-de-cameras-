
export enum CameraStatus {
  NORMAL = 'Funcionando Normalmente',
  MANUTENCAO = 'Necessita Manutenção',
  PROBLEMA = 'Mau Funcionamento'
}

export interface Camera {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  fov: number;
  range: number;
  status: CameraStatus;
  notes?: string;
  locked?: boolean;
}

export interface DVR {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface ProjectData {
  cameras: Camera[];
  zones: Zone[];
  dvr: DVR | null;
  mapImage: string | null;
}

export type AppMode = 'landing' | 'editor' | 'viewer';
