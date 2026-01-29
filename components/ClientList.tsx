import React, { useState } from 'react';
import { Client } from '../types';
import { Search, MapPin, Phone, Building2, UserPlus, Trash2, Eye, User, Scale } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onAddClient?: () => void;
  onDeleteClient?: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onAddClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (window.confirm('Tem a certeza que deseja apagar este cliente e todos os seus equipamentos?')) {
        if (onDeleteClient) onDeleteClient(clientId);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                 <Building2 className="w-6 h-6" />
             </div>
             <div>
                 <h2 className="text-xl font-bold text-slate-800">Carteira de Clientes</h2>
                 <p className="text-xs text-slate-500">{filteredClients.length} registos encontrados</p>
             </div>
         </div>
         
         <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Pesquisar cliente..."
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

      {/* Table Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Contacto</th>
                        <th className="px-6 py-4">Localização</th>
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
                                    <p>Nenhum cliente encontrado.</p>
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
                                        <div className="text-xs text-slate-400 font-mono">{client.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <User className="w-3 h-3 text-slate-400" />
                                            {client.contactPerson}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            {client.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-start gap-2 max-w-[200px] truncate">
                                            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                            <span className="truncate" title={client.address}>{client.address}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                            <Scale className="w-3 h-3 mr-1" />
                                            {client.equipments.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {hasUnpaid && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium border border-red-200">Pag. Pendente</span>
                                            )}
                                            {hasExpired && (
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium border border-amber-200">Expirado</span>
                                            )}
                                            {!hasUnpaid && !hasExpired && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium border border-green-200">Regular</span>
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

export default ClientList;