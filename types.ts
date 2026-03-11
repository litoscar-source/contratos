export enum EquipmentType {
  PCM = 'PCM',
  PVS = 'PVS',
  PVM = 'PVM',
  Other = 'Outro'
}

export enum VisitType {
  RECONSTRUCTION = 'Reconstrução',
  CALIBRATION = 'Calibração',
  ASSIST_LIGHT = 'Assistência Ligeiro',
  ASSIST_TRUCK = 'Assistência Pesado'
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
  type: VisitType | string;
  technician: string;
  notes: string;
  files: Attachment[]; 
  viewerChanged?: boolean;
  oldViewerSerial?: string;
  newViewerSerial?: string;
  clientName?: string;
  equipmentName?: string;
  
  // New fields from import
  lastVisitCE?: string; // ULTIMA VISITA CE
  truckVisit?: string; // VISITA CAMIÃO
  lightVisit2?: string; // VISITA LIGEIRO2
  truckActivitySuggestion?: string; // Sugestão atividade camião
  nextLightActivity?: string; // Próxima atividade ligeiro
  restriction?: string; // Restrição
}

export interface Contract {
  id: string;
  equipmentId: string;
  status?: string; // ESTADO
  serviceType?: string; // Tipo de Serviço
  estimatedHH?: string; // H-H Estimado
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
  activeId?: string;            // ID Ativo
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
  primaveraId?: string; // Cliente Primavera
  name: string;
  fcm?: string; // FCM
  address: string;
  locality: string;
  municipality?: string;
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