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
  clientName?: string;
  equipmentName?: string;
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
  contractFile?: Attachment;
  renewalFile?: Attachment;
}

export interface Equipment {
  id: string;
  clientId: string;
  
  // New Location & Identification Fields
  geoGrid?: string;             // Localização geográfica
  deliveryAddress?: string;     // MORADA DE ENTREGA
  locality?: string;            // LOCALIDADE
  municipality?: string;        // CONCELHO
  district?: string;            // DISTRITO
  executionSite?: string;       // Local de Execução consolidado
  description?: string;         // Descrição do Serviço / Equipamento
  
  location: string;             // Field already in use for quick ref
  productName: string;          // TIPO EQUIPAMENTO
  weightCapacity: string;       // CAPACIDADE CE
  loadCells?: string;           // CÉLULA DE CARGA
  installDate: string;
  type: EquipmentType;
  equipmentSerial: string;      // NÚMERO DE SÉRIE EQUIPAMENTO
  viewerModel: string;          // VISOR
  viewerSerial: string;         // NÚMERO DE SÉRIE VISOR
  
  visits: Visit[];
  contract?: Contract;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  locality: string;
  district: string;
  contactPerson: string;
  email: string;
  phone: string;
  equipments: Equipment[];
}

export type PageView = 'DASHBOARD' | 'CLIENTS' | 'CALENDAR';

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