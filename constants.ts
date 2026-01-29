import { Client, EquipmentType, VisitType } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Logística Norte SA',
    address: 'Zona Industrial da Maia, Setor 3',
    contactPerson: 'Eng. Roberto Silva',
    email: 'roberto@logisticanorte.pt',
    phone: '+351 912 345 678',
    equipments: [
      {
        id: 'e1',
        clientId: 'c1',
        location: 'Armazém A - Entrada',
        productName: 'Báscula Rodoviária 18m',
        weightCapacity: '60000 kg',
        loadCells: '(8) Giropes G8R',
        installDate: '2020-05-15',
        type: EquipmentType.PCM,
        equipmentSerial: 'PCM-2020-8842',
        viewerModel: 'Diade Series',
        viewerSerial: 'D-9921',
        visits: [
          {
            id: 'v1',
            equipmentId: 'e1',
            date: '2023-11-10',
            type: VisitType.ASSIST_TRUCK,
            technician: 'Carlos Mendes',
            notes: 'Aferição anual e limpeza das células.',
            files: [{ name: 'certificado_afericao_2023.pdf' }]
          }
        ],
        contract: {
          id: 'ctr1',
          equipmentId: 'e1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          invoiceNumber: 'FT 2024/004',
          paymentDate: '2024-01-15',
          isPaid: true,
          totalLightVisits: 2,
          usedLightVisits: 0,
          totalTruckVisits: 2,
          usedTruckVisits: 1
        }
      }
    ]
  },
  {
    id: 'c2',
    name: 'AgroIndústria Vale',
    address: 'Herdade do Sol, Beja',
    contactPerson: 'Maria João',
    email: 'mjoao@agrovale.pt',
    phone: '+351 966 555 444',
    equipments: [
      {
        id: 'e2',
        clientId: 'c2',
        location: 'Silo Principal',
        productName: 'Balança de Fluxo',
        weightCapacity: '500 kg',
        loadCells: '(4) Zemic H8C',
        installDate: '2021-08-20',
        type: EquipmentType.PVS,
        equipmentSerial: 'PVS-21-004',
        viewerModel: 'DD1010',
        viewerSerial: 'DD-552',
        visits: [],
        contract: {
          id: 'ctr2',
          equipmentId: 'e2',
          startDate: '2024-03-01',
          endDate: '2025-02-28',
          invoiceNumber: 'FT 2024/102',
          isPaid: false, // Not paid yet
          totalLightVisits: 1,
          usedLightVisits: 0,
          totalTruckVisits: 0,
          usedTruckVisits: 0
        }
      },
      {
        id: 'e3',
        clientId: 'c2',
        location: 'Portaria Pesados',
        productName: 'Ponte Pesadora',
        weightCapacity: '80000 kg',
        loadCells: '(8) Utilcell 740',
        installDate: '2019-02-10',
        type: EquipmentType.PCM,
        equipmentSerial: 'PCM-19-332',
        viewerModel: 'Diade',
        viewerSerial: 'OLD-883',
        visits: [
           {
            id: 'v2',
            equipmentId: 'e3',
            date: '2024-01-20',
            type: VisitType.RECONSTRUCTION,
            technician: 'Pedro Santos',
            notes: 'Reconstrução total. Substituição de visor.',
            viewerChanged: true,
            oldViewerSerial: 'OLD-883',
            newViewerSerial: 'NEW-9922',
            files: [{ name: 'relatorio_reconstrucao.pdf' }]
          }
        ],
        contract: {
          id: 'ctr3',
          equipmentId: 'e3',
          startDate: '2024-03-01',
          endDate: '2025-02-28',
          invoiceNumber: 'FT 2024/103',
          isPaid: false,
          totalLightVisits: 0,
          usedLightVisits: 0,
          totalTruckVisits: 3,
          usedTruckVisits: 1
        }
      }
    ]
  }
];