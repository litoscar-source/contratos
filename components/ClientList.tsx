import React, { useState } from 'react';
import { Client } from '../types';
import { Search, MapPin, Phone, Building2, UserPlus, Trash2, Eye, User, Scale, Filter, Globe } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onAddClient?: () => void;
  onDeleteClient?: (clientId: string) => void;
}

type FilterStatus = 'ALL' | 'UNPAID' | 'EXPIRED' | 'REGULAR';

const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onAddClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  const filteredClients = clients.filter(c => {
    // Text search
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.locality.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status Filter
    const hasUnpaid = c.equipments.some(e => e.contract && !e.contract.isPaid);
    const hasExpired = c.equipments.some(e => e.contract && new Date(e.contract.endDate) < new Date());

    if (statusFilter === 'UNPAID') return hasUnpaid;
    if (statusFilter === 'EXPIRED') return hasExpired;
    if (statusFilter === 'REGULAR') return !hasUnpaid && !hasExpired && c.equipments.length > 0;
    
    return true;
  });

  const handleDelete = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (window.confirm('Tem a certeza que deseja apagar este cliente e todos os seus equipamentos?')) {
        if (onDeleteClient) onDeleteClient(clientId);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col space-y-4">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Building2 className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Carteira de Clientes</h2>
                    <p className="text-xs text-slate-500">{filteredClients.length} registos filtrados</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar cliente ou localidade..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {onAddClient && (
                    <button 
                    onClick={onAddClient}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo Cliente</span>
                    </button>
                )}
            </div>
         </div>

         {/* Filters Bar */}
         <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2 uppercase tracking-wider">
                <Filter className="w-3 h-3" /> Estado:
            </span>
            <FilterTab active={statusFilter === 'ALL'} label="Todos" onClick={() => setStatusFilter('ALL')} color="bg-slate-100 text-slate-600" />
            <FilterTab active={statusFilter === 'REGULAR'} label="Regular" onClick={() => setStatusFilter('REGULAR')} color="bg-green-100 text-green-700" />
            <FilterTab active={statusFilter === 'UNPAID'} label="Pagamento Pendente" onClick={() => setStatusFilter('UNPAID')} color="bg-red-100 text-red-700" />
            <FilterTab active={statusFilter === 'EXPIRED'} label="Contrato Expirado" onClick={() => setStatusFilter('EXPIRED')} color="bg-amber-100 text-amber-700" />
         </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-4">Cliente / Contacto</th>
                        <th className="px-6 py-4">Morada</th>
                        <th className="px-6 py-4">Localidade / Distrito</th>
                        <th className="px-6 py-4 text-center">Equipamentos</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredClients.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center justify-center">
                                    <Building2 className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Nenhum cliente corresponde aos filtros atuais.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredClients.map((client) => {
                            const hasUnpaid = client.equipments.some(e => e.contract && !e.contract.isPaid);
                            const hasExpired = client.equipments.some(e => e.contract && new Date(e.contract.endDate) < new Date());
                            
                            return (
                                <tr 
                                    key={client.id} 
                                    onClick={() => onSelectClient(client)}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{client.name}</div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                            <User className="w-3 h-3" />
                                            {client.contactPerson}
                                            <span className="mx-1">•</span>
                                            <Phone className="w-3 h-3" />
                                            {client.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-start gap-2 max-w-[200px] truncate">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                            <span className="truncate" title={client.address}>{client.address}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3 h-3 text-slate-400" />
                                                <span className="font-medium">{client.locality}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider ml-[18px]">
                                                {client.district}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                            <Scale className="w-3 h-3 mr-1" />
                                            {client.equipments.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            {hasUnpaid && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-bold border border-red-200 uppercase">Pendente</span>
                                            )}
                                            {hasExpired && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-bold border border-amber-200 uppercase">Expirado</span>
                                            )}
                                            {!hasUnpaid && !hasExpired && client.equipments.length > 0 && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-bold border border-green-200 uppercase">Regular</span>
                                            )}
                                            {client.equipments.length === 0 && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-bold border border-slate-200 uppercase">S/ Equip.</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(e, client.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Apagar Cliente"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const FilterTab = ({ active, label, onClick, color }: { active: boolean, label: string, onClick: () => void, color: string }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
            active 
                ? `${color.replace('text-', 'border-').replace('100', '400')} ${color} shadow-sm scale-105` 
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
        }`}
    >
        {label}
    </button>
);

export default ClientList;