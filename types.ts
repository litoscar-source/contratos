export enum EquipmentType {
  PCM = 'PCM',
  PVS = 'PVS',
  PVM = 'PVM',
  Other = 'Outro'
}

export enum VisitType {
  RECONSTRUCTION = 'Reconstrução',
  ASSIST_LIGHT = 'Assistência Ligeira',
  ASSIST_TRUCK = 'Assistência Camião'
}

export interface Attachment {
  name: string;
  url?: string;
  type?: string;
}

export interface Visit {
  id: string;
  equipmentId: string;
  date: string;
  type: VisitType;
  technician: string;
  notes: string;
  files: Attachment[]; 
  viewerChanged?: boolean;
  oldViewerSerial?: string;
  newViewerSerial?: string;
}

export interface Contract {
  id: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  invoiceNumber: string;
  paymentDate?: string;
  isPaid: boolean;
  totalLightVisits: number;
  usedLightVisits: number;
  totalTruckVisits: number;
  usedTruckVisits: number;
  renewed?: boolean;
  renewalDate?: string;
  contractFile?: Attachment; // New field for the contract PDF
}

export interface Equipment {
  id: string;
  clientId: string;
  location: string;
  productName: string; // e.g., "Báscula Ponte"
  weightCapacity: string; // e.g., "60 Ton"
  loadCells?: string; // New field for load cells description
  installDate: string;
  type: EquipmentType;
  equipmentSerial: string;
  viewerModel: string;
  viewerSerial: string;
  visits: Visit[];
  contract?: Contract;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  equipments: Equipment[];
}

export type PageView = 'DASHBOARD' | 'CLIENTS' | 'CALENDAR';

// Helper to format date to DD/MM/YYYY
export const formatDatePT = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-PT').format(date);
  } catch (e) {
    return dateString;
  }
};