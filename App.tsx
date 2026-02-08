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
import AgendaView from './components/AgendaView';
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
  Lock,
  Paperclip,
  ShieldCheck,
  AlignLeft,
  Navigation,
  Globe,
  Map
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
      const currentClients = [...clients];
      importedClients.forEach(imported => {
          const existingIndex = currentClients.findIndex(c => c.name.toLowerCase() === imported.name.toLowerCase());
          if (existingIndex >= 0) {
              const existingClient = currentClients[existingIndex];
              const newEquipments = imported.equipments.filter(ie => 
                  !existingClient.equipments.some(ee => ee.equipmentSerial === ie.equipmentSerial)
              );
              currentClients[existingIndex] = {
                  ...existingClient,
                  equipments: [...existingClient.equipments, ...newEquipments]
              };
          } else {
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
            return { ...c, equipments: c.equipments.filter(e => e.id !== equipId) };
        }
        return c;
    });
    setClients(updatedClients);
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
      const updatedClients = clients.map(c => 
        c.id === editingClient.id ? { ...c, ...clientData } : c
      );
      setClients(updatedClients);
      if (selectedClient && selectedClient.id === editingClient.id) {
        setSelectedClient({ ...selectedClient, ...clientData });
      }
      setEditingClient(undefined);
    } else {
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
                  description: data.description,
                  geoGrid: data.geoGrid,
                  deliveryAddress: data.deliveryAddress,
                  locality: data.locality,
                  municipality: data.municipality,
                  district: data.district,
                  executionSite: data.executionSite,
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
                    contractFile: data.contractFile,
                    renewalFile: data.renewalFile
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
      const newEquipment: Equipment = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: selectedClient.id,
        location: data.location || data.executionSite || '',
        productName: data.productName,
        weightCapacity: data.weightCapacity,
        loadCells: data.loadCells,
        description: data.description,
        geoGrid: data.geoGrid,
        deliveryAddress: data.deliveryAddress,
        locality: data.locality,
        municipality: data.municipality,
        district: data.district,
        executionSite: data.executionSite,
        installDate: data.installDate,
        type: data.type,
        equipmentSerial: data.equipmentSerial,
        viewerModel: data.viewerModel,
        viewerSerial: data.viewerSerial,
        visits: [],
        contract: {
          id: Math.random().toString(36).substr(2, 9),
          equipmentId: '',
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
          contractFile: data.contractFile,
          renewalFile: data.renewalFile
        }
      };
      if(newEquipment.contract) newEquipment.contract.equipmentId = newEquipment.id;
      const updatedClients = clients.map(c => {
        if (c.id === selectedClient.id) {
          return { ...c, equipments: [...c.equipments, newEquipment] };
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
                 contract: { ...e.contract, isPaid: true, paymentDate: paymentData.date, invoiceNumber: paymentData.invoice }
               };
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
    const updatedClient = updatedClients.find(c => c.id === selectedClient.id);
    if(updatedClient) setSelectedClient(updatedClient);
    setIsPaymentModalOpen(false);
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
              let updatedContract = e.contract ? { ...e.contract } : undefined;
              
              if (visitData.id) {
                updatedVisits = e.visits.map(v => v.id === visitData.id ? { ...v, ...visitData } : v);
              } else {
                const newVisit: Visit = { id: Math.random().toString(36).substr(2, 9), equipmentId: selectedEquipment.id, ...visitData };
                updatedVisits = [newVisit, ...e.visits];
                if (updatedContract) {
                   updatedContract = {
                    ...updatedContract,
                    usedLightVisits: visitData.type === VisitType.ASSIST_LIGHT ? updatedContract.usedLightVisits + 1 : updatedContract.usedLightVisits,
                    usedTruckVisits: visitData.type === VisitType.ASSIST_TRUCK ? updatedContract.usedTruckVisits + 1 : updatedContract.usedTruckVisits
                  };
                }
              }
              const updatedEquip = {
                ...e,
                visits: updatedVisits,
                contract: updatedContract,
                viewerSerial: visitData.viewerChanged ? visitData.newViewerSerial : e.viewerSerial
              };
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

  const handleDeleteVisit = (visitId: string) => {
    if (!selectedEquipment || !selectedClient) return;
    
    if (!window.confirm("Tem a certeza que deseja eliminar este registo de visita?")) return;

    const updatedClients = clients.map(c => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          equipments: c.equipments.map(e => {
            if (e.id === selectedEquipment.id) {
              const visitToDelete = e.visits.find(v => v.id === visitId);
              const updatedVisits = e.visits.filter(v => v.id !== visitId);
              
              let updatedContract = e.contract;
              // Revert contract usage if applicable
              if (updatedContract && visitToDelete) {
                  if (visitToDelete.type === VisitType.ASSIST_LIGHT) {
                      updatedContract = { ...updatedContract, usedLightVisits: Math.max(0, updatedContract.usedLightVisits - 1) };
                  } else if (visitToDelete.type === VisitType.ASSIST_TRUCK) {
                      updatedContract = { ...updatedContract, usedTruckVisits: Math.max(0, updatedContract.usedTruckVisits - 1) };
                  }
              }

              const updatedEquip = {
                ...e,
                visits: updatedVisits,
                contract: updatedContract
              };
              
              if (selectedEquipment.id === updatedEquip.id) {
                  setSelectedEquipment(updatedEquip);
              }
              
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
    if (updatedClient) {
        setSelectedClient(updatedClient);
    }

    setEditingVisit(undefined);
    setIsVisitModalOpen(false);
  };

  // --- Main Layout ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-5 h-5 text-blue-400" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">Administrador</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Marques Gestão</h1>
          <p className="text-xs text-slate-400 mt-1">Básculas e Balanças</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard Operacional" 
            active={view === 'DASHBOARD'} 
            onClick={() => setView('DASHBOARD')} 
          />
          <NavItem 
            icon={<Users />} 
            label="Carteira de Clientes" 
            active={view === 'CLIENTS'} 
            onClick={() => setView('CLIENTS')} 
          />
          <NavItem 
            icon={<CalendarCheck />} 
            label="Agenda de Visitas" 
            active={view === 'CALENDAR'} 
            onClick={() => setView('CALENDAR')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">GST</div>
            <div>
              <p className="font-medium text-white">Gestor</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Acesso Administrativo</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-700">
            {view === 'DASHBOARD' && 'Visão Geral Operacional'}
            {view === 'CLIENTS' && 'Gestão de Clientes'}
            {view === 'CALENDAR' && 'Planeamento de Visitas'}
          </h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-sm font-medium transition-colors border border-emerald-100"
             >
                <Upload className="w-4 h-4" />
                Importar Dados Técnicos
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
                    onSelectClient={(c) => { setSelectedClient(c); setSelectedEquipment(null); }}
                    onAddClient={() => { setEditingClient(undefined); setIsAddClientModalOpen(true); }}
                    onDeleteClient={handleDeleteClient}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="mb-4 text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 w-fit transition-colors"
                  >
                    ← Voltar à lista de clientes
                  </button>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex h-full gap-6 animate-in fade-in duration-300">
                      {/* Left Sidebar in detail */}
                      <div className="w-1/3 space-y-4 flex flex-col h-full">
                         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
                            <button onClick={() => { setEditingClient(selectedClient); setIsAddClientModalOpen(true); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full"><Edit2 className="w-4 h-4" /></button>
                            <h2 className="text-xl font-bold text-slate-800 pr-8">{selectedClient.name}</h2>
                            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded inline-block my-2">ID: {selectedClient.id}</span>
                            <div className="space-y-2 text-sm text-slate-600">
                              <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-400"/> {selectedClient.address}</p>
                              <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-slate-400"/> {selectedClient.contactPerson}</p>
                            </div>
                         </div>
                         <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                           <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                             <h3 className="font-semibold text-slate-700">Equipamentos</h3>
                             <button onClick={() => { setEditingEquipment(undefined); setIsAddEquipmentModalOpen(true); }} className="p-1 hover:bg-slate-200 rounded text-slate-500"><Plus className="w-4 h-4" /></button>
                           </div>
                           <div className="overflow-y-auto p-2">
                             {selectedClient.equipments.map(eq => (
                               <div key={eq.id} onClick={() => setSelectedEquipment(eq)} className={`p-3 rounded-lg cursor-pointer transition-all border mb-2 ${selectedEquipment?.id === eq.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                                  <div className="flex justify-between items-start">
                                    <p className="font-semibold text-sm text-slate-800">{eq.productName}</p>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEquipment(eq.id); }} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                  <p className="text-xs text-slate-500 truncate">{eq.location || eq.executionSite}</p>
                                  <p className="text-[10px] font-mono text-slate-400 mt-1">{eq.equipmentSerial}</p>
                               </div>
                             ))}
                           </div>
                         </div>
                      </div>
                      {/* Detailed Equipment View */}
                      <div className="w-2/3 h-full flex flex-col">
                        {selectedEquipment ? (
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col items-start bg-slate-50 relative">
                                <button onClick={() => { setEditingEquipment(selectedEquipment); setIsAddEquipmentModalOpen(true); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><Edit2 className="w-5 h-5" /></button>
                                <h2 className="text-xl font-bold text-slate-900 flex items-start gap-2 pr-12">
                                   <Scale className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                                   <span>{selectedEquipment.productName} - {selectedEquipment.equipmentSerial}</span>
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Navigation className="w-3.5 h-3.5"/> Local de Execução: {selectedEquipment.executionSite || 'Não definido'}</p>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-8 overflow-y-auto">
                               <div className="space-y-6">
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><AlignLeft className="w-3.5 h-3.5"/> Especificações Técnicas</h4>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                       <div><p className="text-slate-400 text-[10px] font-bold uppercase">Capacidade CE</p><p className="font-semibold text-slate-700">{selectedEquipment.weightCapacity}</p></div>
                                       <div><p className="text-slate-400 text-[10px] font-bold uppercase">Células de Carga</p><p className="font-semibold text-slate-700">{selectedEquipment.loadCells || 'N/A'}</p></div>
                                       <div><p className="text-slate-400 text-[10px] font-bold uppercase">Visor</p><p className="font-semibold text-slate-700">{selectedEquipment.viewerModel}</p></div>
                                       <div><p className="text-slate-400 text-[10px] font-bold uppercase">N/S Visor</p><p className="font-mono text-slate-700">{selectedEquipment.viewerSerial}</p></div>
                                       <div className="col-span-2 border-t border-slate-200 pt-2"><p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Descrição do Serviço</p><p className="text-slate-600 italic leading-relaxed text-xs">{selectedEquipment.description || 'Sem descrição adicional.'}</p></div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-3.5 h-3.5"/> Geolocalização e Morada</h4>
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-sm">
                                       <div className="flex justify-between"><span className="text-slate-400">Morada Entrega:</span><span className="text-slate-700 font-medium text-right ml-4">{selectedEquipment.deliveryAddress || '-'}</span></div>
                                       <div className="flex justify-between"><span className="text-slate-400">Concelho:</span><span className="text-slate-700 font-medium">{selectedEquipment.municipality || '-'}</span></div>
                                       <div className="flex justify-between"><span className="text-slate-400">Localidade:</span><span className="text-slate-700 font-medium">{selectedEquipment.locality || '-'}</span></div>
                                       <div className="flex justify-between"><span className="text-slate-400">Distrito:</span><span className="text-slate-700 font-medium uppercase">{selectedEquipment.district || '-'}</span></div>
                                       {selectedEquipment.geoGrid && <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-blue-600 font-mono text-xs font-bold"><Globe className="w-3 h-3"/> {selectedEquipment.geoGrid}</div>}
                                    </div>
                                  </div>
                               </div>
                               <div className="space-y-6">
                                  <div className="bg-slate-900 text-white p-5 rounded-xl shadow-inner relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-8 opacity-10"><FileText className="w-24 h-24" /></div>
                                     <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Plano de Manutenção</h4>
                                     {selectedEquipment.contract ? (
                                       <div className="space-y-4">
                                          <div className="flex justify-between items-center"><span className="text-xs text-slate-400">Válido até:</span><span className="font-bold text-sm">{formatDatePT(selectedEquipment.contract.endDate)}</span></div>
                                          <div className="grid grid-cols-2 gap-3">
                                             <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                                                <p className="text-[10px] text-slate-400 uppercase mb-1">Ligeiros</p>
                                                <p className="text-lg font-bold text-blue-400">{selectedEquipment.contract.usedLightVisits}/{selectedEquipment.contract.totalLightVisits}</p>
                                             </div>
                                             <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                                                <p className="text-[10px] text-slate-400 uppercase mb-1">Camião</p>
                                                <p className="text-lg font-bold text-blue-400">{selectedEquipment.contract.usedTruckVisits}/{selectedEquipment.contract.totalTruckVisits}</p>
                                             </div>
                                          </div>
                                          <button 
                                            onClick={() => { setEditingVisit(undefined); setIsVisitModalOpen(true); }} 
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                                          >
                                            <Calendar className="w-4 h-4"/> Registar Nova Intervenção
                                          </button>
                                       </div>
                                     ) : (
                                       <p className="text-xs text-slate-500 italic">Nenhum contrato ativo para este equipamento.</p>
                                     )}
                                  </div>
                                  <div className="flex-1 overflow-hidden flex flex-col">
                                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><History className="w-3.5 h-3.5"/> Histórico</h4>
                                     <div className="space-y-3 overflow-y-auto pr-1">
                                        {selectedEquipment.visits.length === 0 ? <p className="text-[10px] text-slate-400 italic">Sem registos.</p> : selectedEquipment.visits.map(v => (
                                          <div 
                                            key={v.id} 
                                            onClick={() => { setEditingVisit(v); setIsVisitModalOpen(true); }}
                                            className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors group"
                                          >
                                             <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">{v.type}</span>
                                                <span className="text-[10px] text-slate-400">{formatDatePT(v.date)}</span>
                                             </div>
                                             <p className="text-[10px] text-slate-500 line-clamp-1 italic">{v.notes}</p>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50"><Scale className="w-12 h-12 mb-3 opacity-50"/><p>Selecione um equipamento técnico</p></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'CALENDAR' && <AgendaView clients={clients} />}
        </div>
      </main>

      {/* Modals */}
      {isImportModalOpen && <ImportModal onClose={() => setIsImportModalOpen(false)} onImport={handleImportData} />}
      {isVisitModalOpen && selectedEquipment && (
          <VisitModal 
            initialData={editingVisit} 
            equipment={selectedEquipment} 
            onClose={() => { setIsVisitModalOpen(false); setEditingVisit(undefined); }} 
            onSave={handleSaveVisit} 
            onDelete={handleDeleteVisit} 
          />
      )}
      {isAddClientModalOpen && <AddClientModal initialData={editingClient} onClose={() => setIsAddClientModalOpen(false)} onSave={handleSaveClient} />}
      {isAddEquipmentModalOpen && <AddEquipmentModal initialData={editingEquipment} onClose={() => setIsAddEquipmentModalOpen(false)} onSave={handleSaveEquipment} />}
      {isPaymentModalOpen && selectedEquipment?.contract && <PaymentModal contract={selectedEquipment.contract} onClose={() => setIsPaymentModalOpen(false)} onSave={handleRegisterPayment} />}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    {label}
  </button>
);

export default App;