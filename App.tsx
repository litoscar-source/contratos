import React, { useState } from 'react';
import { Client, PageView, Equipment, VisitType, Visit, formatDatePT } from './types';
import { MOCK_CLIENTS } from './constants';
import ClientList from './components/ClientList';
import Dashboard from './components/Dashboard';
import VisitModal from './components/VisitModal';
import AddClientModal from './components/AddClientModal';
import AddEquipmentModal from './components/AddEquipmentModal';
import PaymentModal from './components/PaymentModal';
import ImportModal from './components/ImportModal';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Settings, 
  Plus, 
  Scale, 
  CreditCard,
  History,
  AlertCircle,
  MapPin,
  Calendar,
  FileText,
  Edit2,
  Upload,
  Download,
  Trash2,
  Lock
} from 'lucide-react';

const App = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [view, setView] = useState<PageView>('DASHBOARD');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Modal States
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Edit States
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined);
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>(undefined);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === '9816') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setLoginPassword('');
    }
  };

  const handleImportData = (importedClients: Client[]) => {
      // Merge logic: Add new clients, if client name exists, merge equipments
      const currentClients = [...clients];
      
      importedClients.forEach(imported => {
          const existingIndex = currentClients.findIndex(c => c.name.toLowerCase() === imported.name.toLowerCase());
          
          if (existingIndex >= 0) {
              // Client exists, merge equipments
              // Avoid duplicates by checking serial if available
              const existingClient = currentClients[existingIndex];
              const newEquipments = imported.equipments.filter(ie => 
                  !existingClient.equipments.some(ee => ee.equipmentSerial === ie.equipmentSerial)
              );
              
              currentClients[existingIndex] = {
                  ...existingClient,
                  equipments: [...existingClient.equipments, ...newEquipments]
              };
          } else {
              // New client
              currentClients.push(imported);
          }
      });

      setClients(currentClients);
      setIsImportModalOpen(false);
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    setClients(updatedClients);
    if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null);
        setSelectedEquipment(null);
    }
  };

  const handleDeleteEquipment = (equipId: string) => {
    if (!selectedClient) return;
    if (!window.confirm("Tem a certeza que deseja eliminar este equipamento?")) return;

    const updatedClients = clients.map(c => {
        if (c.id === selectedClient.id) {
            return {
                ...c,
                equipments: c.equipments.filter(e => e.id !== equipId)
            };
        }
        return c;
    });

    setClients(updatedClients);
    
    // Update selection state
    const updatedClient = updatedClients.find(c => c.id === selectedClient.id);
    if (updatedClient) {
        setSelectedClient(updatedClient);
        if (selectedEquipment && selectedEquipment.id === equipId) {
            setSelectedEquipment(null);
        }
    }
  };

  const handleSaveClient = (clientData: any) => {
    if (editingClient) {
      // Update existing
      const updatedClients = clients.map(c => 
        c.id === editingClient.id ? { ...c, ...clientData } : c
      );
      setClients(updatedClients);
      if (selectedClient && selectedClient.id === editingClient.id) {
        setSelectedClient({ ...selectedClient, ...clientData });
      }
      setEditingClient(undefined);
    } else {
      // Create new
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9),
        ...clientData,
        equipments: []
      };
      setClients([...clients, newClient]);
    }
    setIsAddClientModalOpen(false);
  };

  const handleSaveEquipment = (data: any) => {
    if (!selectedClient) return;

    if (editingEquipment) {
      // Update existing
       const updatedClients = clients.map(c => {
        if (c.id === selectedClient.id) {
          return {
            ...c,
            equipments: c.equipments.map(e => {
              if (e.id === editingEquipment.id) {
                const updatedEquip = {
                  ...e,
                  location: data.location,
                  productName: data.productName,
                  weightCapacity: data.weightCapacity,
                  loadCells: data.loadCells,
                  installDate: data.installDate,
                  type: data.type,
                  equipmentSerial: data.equipmentSerial,
                  viewerModel: data.viewerModel,
                  viewerSerial: data.viewerSerial,
                  contract: e.contract ? {
                    ...e.contract,
                    startDate: data.contractStartDate,
                    endDate: data.contractEndDate,
                    invoiceNumber: data.contractInvoice,
                    totalLightVisits: data.totalLightVisits,
                    totalTruckVisits: data.totalTruckVisits,
                    isPaid: data.isPaid,
                    renewed: data.renewed,
                    renewalDate: data.renewalDate,
                    contractFile: data.contractFile // Save the file
                  } : e.contract
                };
                if(selectedEquipment?.id === updatedEquip.id) setSelectedEquipment(updatedEquip);
                return updatedEquip;
              }
              return e;
            })
          };
        }
        return c;
      });
      setClients(updatedClients);
      const updatedClient = updatedClients.find(c => c.id === selectedClient.id);
      if(updatedClient) setSelectedClient(updatedClient);
      setEditingEquipment(undefined);
    } else {
      // Create new
      const newEquipment: Equipment = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: selectedClient.id,
        location: data.location,
        productName: data.productName,
        weightCapacity: data.weightCapacity,
        loadCells: data.loadCells,
        installDate: data.installDate,
        type: data.type,
        equipmentSerial: data.equipmentSerial,
        viewerModel: data.viewerModel,
        viewerSerial: data.viewerSerial,
        visits: [],
        contract: {
          id: Math.random().toString(36).substr(2, 9),
          equipmentId: '', // Set below
          startDate: data.contractStartDate,
          endDate: data.contractEndDate,
          invoiceNumber: data.contractInvoice,
          isPaid: data.isPaid,
          totalLightVisits: data.totalLightVisits,
          usedLightVisits: 0,
          totalTruckVisits: data.totalTruckVisits,
          usedTruckVisits: 0,
          renewed: data.renewed,
          renewalDate: data.renewalDate,
          contractFile: data.contractFile // Save the file
        }
      };
      if(newEquipment.contract) newEquipment.contract.equipmentId = newEquipment.id;

      const updatedClients = clients.map(c => {
        if (c.id === selectedClient.id) {
          return {
            ...c,
            equipments: [...c.equipments, newEquipment]
          };
        }
        return c;
      });

      setClients(updatedClients);
      const updatedClient = updatedClients.find(c => c.id === selectedClient.id);
      if(updatedClient) setSelectedClient(updatedClient);
    }
    
    setIsAddEquipmentModalOpen(false);
  };

  const handleRegisterPayment = (paymentData: { date: string, invoice: string }) => {
    if (!selectedEquipment || !selectedClient || !selectedEquipment.contract) return;

    const updatedClients = clients.map(c => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          equipments: c.equipments.map(e => {
            if (e.id === selectedEquipment.id && e.contract) {
               const updatedEquip = {
                 ...e,
                 contract: {
                   ...e.contract,
                   isPaid: true,
                   paymentDate: paymentData.date,
                   invoiceNumber: paymentData.invoice
                 }
               };
               setSelectedEquipment(updatedEquip); // Update local selected state immediately
               return updatedEquip;
            }
            return e;
          })
        };
      }
      return c;
    });

    setClients(updatedClients);
    const updatedClient = updatedClients.find(c => c.id === selectedClient.id);
    if(updatedClient) setSelectedClient(updatedClient);
    
    setIsPaymentModalOpen(false);
  };

  const handleDeleteVisit = (visitId: string) => {
    if (!selectedEquipment || !selectedClient) return;
    
    const updatedClients = clients.map(c => {
        if (c.id === selectedClient.id) {
             return {
                 ...c,
                 equipments: c.equipments.map(e => {
                     if (e.id === selectedEquipment.id) {
                         const visitToDelete = e.visits.find(v => v.id === visitId);
                         const updatedVisits = e.visits.filter(v => v.id !== visitId);
                         
                         // Revert usage counts if needed
                         let updatedContract = e.contract ? { ...e.contract } : undefined;
                         if (updatedContract && visitToDelete) {
                             if (visitToDelete.type === VisitType.ASSIST_LIGHT) {
                                 updatedContract.usedLightVisits = Math.max(0, updatedContract.usedLightVisits - 1);
                             } else if (visitToDelete.type === VisitType.ASSIST_TRUCK) {
                                 updatedContract.usedTruckVisits = Math.max(0, updatedContract.usedTruckVisits - 1);
                             }
                         }

                         const updatedEquip = {
                             ...e,
                             visits: updatedVisits,
                             contract: updatedContract
                         };
                         if(selectedEquipment?.id === updatedEquip.id) setSelectedEquipment(updatedEquip);
                         return updatedEquip;
                     }
                     return e;
                 })
             };
        }
        return c;
    });
    setClients(updatedClients);
    const updatedClient = updatedClients.find(c => c.id === selectedClient.id);
    if(updatedClient) setSelectedClient(updatedClient);

    setEditingVisit(undefined);
    setIsVisitModalOpen(false);
  };

  const handleSaveVisit = (visitData: any) => {
    if (!selectedEquipment || !selectedClient) return;

    const updatedClients = clients.map(c => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          equipments: c.equipments.map(e => {
            if (e.id === selectedEquipment.id) {
              
              let updatedVisits = [...e.visits];
              let updatedContract = { ...e.contract! };

              if (visitData.id) {
                // Update existing visit
                updatedVisits = e.visits.map(v => v.id === visitData.id ? { ...v, ...visitData } : v);
              } else {
                // New Visit
                const newVisit: Visit = {
                    id: Math.random().toString(36).substr(2, 9),
                    equipmentId: selectedEquipment.id,
                    ...visitData
                };
                updatedVisits = [newVisit, ...e.visits];

                 // Update contract usage
                 updatedContract = e.contract ? {
                    ...e.contract,
                    usedLightVisits: visitData.type === VisitType.ASSIST_LIGHT 
                      ? e.contract.usedLightVisits + 1 
                      : e.contract.usedLightVisits,
                    usedTruckVisits: visitData.type === VisitType.ASSIST_TRUCK
                      ? e.contract.usedTruckVisits + 1
                      : e.contract.usedTruckVisits
                  } : updatedContract;
              }

              const updatedEquip = {
                ...e,
                visits: updatedVisits,
                contract: updatedContract,
                // Update viewer if needed
                viewerSerial: visitData.viewerChanged ? visitData.newViewerSerial : e.viewerSerial
              };
              // Update local selection state
              setSelectedEquipment(updatedEquip);
              return updatedEquip;
            }
            return e;
          })
        };
      }
      return c;
    });

    setClients(updatedClients);
    const updatedSelectedClient = updatedClients.find(c => c.id === selectedClient.id);
    if(updatedSelectedClient) setSelectedClient(updatedSelectedClient);

    setEditingVisit(undefined);
    setIsVisitModalOpen(false);
  };

  const checkContractStatus = (equip: Equipment) => {
    if (!equip.contract) return 'Sem Contrato';
    if (!equip.contract.isPaid) return 'Pagamento Pendente';
    
    const today = new Date();
    const end = new Date(equip.contract.endDate);
    if (end < today) return 'Expirado';

    return 'Ativo';
  };

  // --- Login Logic ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Marques Gestão</h1>
            <p className="text-slate-500 mt-2 text-sm">Controlo de Acesso</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-center">Introduza o código PIN</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 text-center text-2xl tracking-[0.5em] font-mono outline-none transition-all ${loginError ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white'}`}
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-xs text-center font-medium mt-2 animate-pulse">
                  Código incorreto.
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">© 2024 Marques Gestão de Contratos</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Sections ---

  const renderClientDetail = () => {
    if (!selectedClient) return null;
    return (
      <div className="flex h-full gap-6 animate-in fade-in duration-300">
        {/* Left: Client Info & Equipment List */}
        <div className="w-1/3 space-y-4 flex flex-col h-full">
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
              <button 
                onClick={() => {
                    setEditingClient(selectedClient);
                    setIsAddClientModalOpen(true);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all"
                title="Editar Cliente"
              >
                  <Edit2 className="w-4 h-4" />
              </button>
              <div className="flex justify-between items-start mb-2 pr-8">
                <h2 className="text-xl font-bold text-slate-800">{selectedClient.name}</h2>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded inline-block mb-3">ID: {selectedClient.id}</span>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-400"/> {selectedClient.address}</p>
                <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-slate-400"/> {selectedClient.contactPerson}</p>
              </div>
           </div>

           <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="font-semibold text-slate-700">Equipamentos</h3>
               <button 
                  onClick={() => {
                      setEditingEquipment(undefined);
                      setIsAddEquipmentModalOpen(true);
                  }}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  title="Adicionar Equipamento"
                >
                  <Plus className="w-4 h-4" />
               </button>
             </div>
             <div className="overflow-y-auto p-2">
               {selectedClient.equipments.map(eq => (
                 <div 
                   key={eq.id}
                   onClick={() => setSelectedEquipment(eq)}
                   className={`p-3 rounded-lg cursor-pointer transition-all border mb-2 group relative ${selectedEquipment?.id === eq.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                 >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-slate-800">{eq.productName}</p>
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEquipment(eq.id);
                        }}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Eliminar Equipamento"
                      >
                          <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            checkContractStatus(eq) === 'Ativo' ? 'bg-green-100 text-green-700' : 
                            checkContractStatus(eq) === 'Expirado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {checkContractStatus(eq)}
                        </span>
                        <p className="text-xs text-slate-500 truncate">{eq.location}</p>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-1">{eq.equipmentSerial}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Right: Equipment Detail */}
        <div className="w-2/3 h-full flex flex-col">
          {selectedEquipment ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex flex-col items-start bg-slate-50 rounded-t-xl relative">
                  <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">Instalado: {formatDatePT(selectedEquipment.installDate)}</p>
                        <button 
                            onClick={() => {
                                setEditingEquipment(selectedEquipment);
                                setIsAddEquipmentModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Editar Equipamento"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                  </div>

                  <h2 className="text-lg font-bold text-slate-800 flex items-start gap-2 leading-relaxed pr-8">
                     <Scale className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                     <span>
                         Equipamento: {selectedEquipment.location} - {selectedEquipment.productName} N/S {selectedEquipment.equipmentSerial} - Capacidade: {selectedEquipment.weightCapacity} | Células: {selectedEquipment.loadCells || 'N/A'} | Visor: {selectedEquipment.viewerModel} - N/S {selectedEquipment.viewerSerial}
                     </span>
                  </h2>
              </div>

              {/* Content Grid */}
              <div className="p-6 grid grid-cols-2 gap-6 overflow-y-auto">
                 {/* Technical Specs */}
                 <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Detalhes Técnicos</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <p className="text-slate-500 text-xs">Tipo</p>
                         <p className="font-medium text-slate-700">{selectedEquipment.type}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 text-xs">Nº Série Equip.</p>
                         <p className="font-medium text-slate-700 font-mono">{selectedEquipment.equipmentSerial}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 text-xs">Modelo Visor</p>
                         <p className="font-medium text-slate-700">{selectedEquipment.viewerModel}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 text-xs">Nº Série Visor</p>
                         <p className="font-medium text-slate-700 font-mono bg-yellow-50 px-2 py-0.5 rounded w-fit">
                           {selectedEquipment.viewerSerial}
                         </p>
                       </div>
                       <div className="col-span-2">
                          <p className="text-slate-500 text-xs">Células de Carga</p>
                          <p className="font-medium text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                              {selectedEquipment.loadCells || 'Não especificado'}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Contract Status */}
                 <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex justify-between">
                      <span>Estado Contrato</span>
                      {selectedEquipment.contract?.isPaid ? 
                        <span className="text-green-600 flex items-center gap-1 text-xs normal-case"><CheckIcon className="w-3 h-3"/> Pago</span> : 
                        <span className="text-red-600 flex items-center gap-1 text-xs normal-case"><AlertCircle className="w-3 h-3"/> Pendente</span>
                      }
                    </h4>
                    {selectedEquipment.contract ? (
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Período:</span>
                           <span className={`font-medium ${new Date(selectedEquipment.contract.endDate) < new Date() ? 'text-red-600' : ''}`}>
                             {formatDatePT(selectedEquipment.contract.startDate)} a {formatDatePT(selectedEquipment.contract.endDate)}
                           </span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Fatura:</span>
                           <span className="font-medium">{selectedEquipment.contract.invoiceNumber}</span>
                         </div>
                         {selectedEquipment.contract.isPaid && selectedEquipment.contract.paymentDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Pago em:</span>
                              <span className="font-medium text-green-700">{formatDatePT(selectedEquipment.contract.paymentDate)}</span>
                            </div>
                         )}

                         {/* Contract File Download Link */}
                         {selectedEquipment.contract.contractFile && (
                            <div className="mt-2">
                                <a 
                                    href={selectedEquipment.contract.contractFile.url}
                                    download={selectedEquipment.contract.contractFile.name}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium"
                                >
                                    <FileText className="w-4 h-4" />
                                    Ver Contrato (PDF)
                                    <Download className="w-3 h-3 ml-auto opacity-50" />
                                </a>
                            </div>
                         )}

                         {selectedEquipment.contract.renewed && (
                            <div className="bg-blue-50 border border-blue-100 p-2 rounded flex items-center gap-2 mt-2">
                               <div className="bg-blue-100 p-1 rounded-full">
                                  <Edit2 className="w-3 h-3 text-blue-600" />
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-blue-800">Renovado</p>
                                  {selectedEquipment.contract.renewalDate && (
                                     <p className="text-[10px] text-blue-600">Data: {formatDatePT(selectedEquipment.contract.renewalDate)}</p>
                                  )}
                               </div>
                            </div>
                         )}
                         
                         <div className="bg-slate-50 p-3 rounded-lg space-y-2 mt-2">
                           <p className="text-xs font-semibold text-slate-700">Saldo de Visitas:</p>
                           <div className="flex items-center justify-between text-xs">
                             <span>Ligeiros</span>
                             <div className="flex items-center gap-2">
                               <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-blue-500" 
                                   style={{ width: `${(selectedEquipment.contract.usedLightVisits / selectedEquipment.contract.totalLightVisits) * 100}%` }}
                                 />
                               </div>
                               <span className="font-mono">{selectedEquipment.contract.usedLightVisits}/{selectedEquipment.contract.totalLightVisits}</span>
                             </div>
                           </div>
                           <div className="flex items-center justify-between text-xs">
                             <span>Camião</span>
                             <div className="flex items-center gap-2">
                               <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-purple-500" 
                                   style={{ width: `${(selectedEquipment.contract.usedTruckVisits / selectedEquipment.contract.totalTruckVisits) * 100}%` }}
                                 />
                               </div>
                               <span className="font-mono">{selectedEquipment.contract.usedTruckVisits}/{selectedEquipment.contract.totalTruckVisits}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className="pt-2">
                           {selectedEquipment.contract.isPaid ? (
                             <button 
                               onClick={() => {
                                   setEditingVisit(undefined);
                                   setIsVisitModalOpen(true);
                               }}
                               className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                             >
                               <Calendar className="w-4 h-4" /> Agendar / Registar Visita
                             </button>
                           ) : (
                              <button 
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg text-center transition-colors flex items-center justify-center gap-2 border border-red-200"
                              >
                                <CreditCard className="w-4 h-4" /> Registar Pagamento
                              </button>
                           )}
                         </div>

                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Sem contrato ativo.</p>
                    )}
                 </div>
              </div>

              {/* History Section */}
              <div className="flex-1 bg-slate-50 p-6 overflow-hidden flex flex-col border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Histórico de Intervenções
                </h4>
                <div className="overflow-y-auto space-y-3 pr-2">
                  {selectedEquipment.visits.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Sem registo de visitas.</p>
                  ) : (
                    selectedEquipment.visits.map(visit => (
                      <div key={visit.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm group relative">
                        <button 
                           onClick={() => {
                               setEditingVisit(visit);
                               setIsVisitModalOpen(true);
                           }}
                           className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <p className="font-semibold text-sm text-slate-800">{visit.type}</p>
                             <p className="text-xs text-slate-500">{formatDatePT(visit.date)} • Técnico: {visit.technician}</p>
                           </div>
                           {visit.files.length > 0 && <FileText className="w-4 h-4 text-slate-400" />}
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{visit.notes}</p>
                        {visit.viewerChanged && (
                          <p className="text-xs text-amber-700 mt-2 font-medium">
                            ⚠️ Visor trocado: {visit.oldViewerSerial} ➔ {visit.newViewerSerial}
                          </p>
                        )}
                        {/* File Links in History */}
                        {visit.files && visit.files.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {visit.files.map((file, idx) => (
                                    <a 
                                        key={idx}
                                        href={file.url || '#'} 
                                        download={file.name}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors ${file.url ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200 cursor-default'}`}
                                        title={file.url ? "Clique para descarregar" : "Ficheiro não disponível"}
                                    >
                                        <FileText className="w-3 h-3" />
                                        {file.name}
                                        {file.url && <Download className="w-3 h-3 ml-1 opacity-50" />}
                                    </a>
                                ))}
                            </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Scale className="w-12 h-12 mb-3 opacity-50" />
              <p>Selecione um equipamento para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Marques Gestão de Contratos</h1>
          <p className="text-xs text-slate-400 mt-1">Gestão de Manutenção</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={view === 'DASHBOARD'} 
            onClick={() => setView('DASHBOARD')} 
          />
          <NavItem 
            icon={<Users />} 
            label="Clientes & Equipamentos" 
            active={view === 'CLIENTS'} 
            onClick={() => setView('CLIENTS')} 
          />
          <NavItem 
            icon={<CalendarCheck />} 
            label="Agenda" 
            active={view === 'CALENDAR'} 
            onClick={() => setView('CALENDAR')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">JD</div>
            <div>
              <p className="font-medium">João Dias</p>
              <p className="text-xs text-slate-400">Técnico Sénior</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-700">
            {view === 'DASHBOARD' && 'Visão Geral'}
            {view === 'CLIENTS' && 'Gestão de Clientes'}
            {view === 'CALENDAR' && 'Agenda de Visitas'}
          </h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-sm font-medium transition-colors"
             >
                <Upload className="w-4 h-4" />
                Importar
             </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-6 relative">
          {view === 'DASHBOARD' && <Dashboard clients={clients} />}
          
          {view === 'CLIENTS' && (
            <div className="flex h-full gap-6">
              {!selectedClient ? (
                <div className="w-full h-full overflow-hidden">
                  <ClientList 
                    clients={clients} 
                    onSelectClient={(c) => {
                      setSelectedClient(c);
                      setSelectedEquipment(null);
                    }}
                    onAddClient={() => {
                        setEditingClient(undefined);
                        setIsAddClientModalOpen(true);
                    }}
                    onDeleteClient={handleDeleteClient}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="mb-4 text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 w-fit"
                  >
                    ← Voltar à lista
                  </button>
                  <div className="flex-1 overflow-hidden">
                    {renderClientDetail()}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'CALENDAR' && (
             <div className="h-full flex items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
               <div className="text-center">
                 <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                 <p className="text-lg font-medium">Módulo de Agenda</p>
                 <p className="text-sm">Funcionalidade em desenvolvimento.</p>
               </div>
             </div>
          )}
        </div>
      </main>

      {/* Modals & Overlays */}
      {isImportModalOpen && (
        <ImportModal 
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportData}
        />
      )}

      {isVisitModalOpen && selectedEquipment && (
        <VisitModal 
          initialData={editingVisit}
          equipment={selectedEquipment} 
          onClose={() => setIsVisitModalOpen(false)} 
          onSave={handleSaveVisit}
          onDelete={editingVisit ? handleDeleteVisit : undefined}
        />
      )}

      {isAddClientModalOpen && (
        <AddClientModal 
          initialData={editingClient}
          onClose={() => setIsAddClientModalOpen(false)}
          onSave={handleSaveClient}
        />
      )}

      {isAddEquipmentModalOpen && (
        <AddEquipmentModal 
          initialData={editingEquipment}
          onClose={() => setIsAddEquipmentModalOpen(false)}
          onSave={handleSaveEquipment}
        />
      )}
      
      {isPaymentModalOpen && selectedEquipment?.contract && (
        <PaymentModal 
          contract={selectedEquipment.contract}
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={handleRegisterPayment}
        />
      )}

    </div>
  );
};

// --- Helper Components ---

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    {label}
  </button>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export default App;