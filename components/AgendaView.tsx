import React, { useState } from 'react';
import { Client, Visit, formatDatePT } from '../types';
import { Calendar as CalendarIcon, Clock, User, Building, ExternalLink, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaViewProps {
  clients: Client[];
  onSelectVisit?: (visit: Visit, client: Client) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ clients }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const monthName = new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(viewDate);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const resetToToday = () => setViewDate(new Date());

  // Collect all visits from all equipments of all clients
  const allVisits: (Visit & { clientName: string; equipmentName: string; locationInfo: string })[] = [];
  clients.forEach(client => {
    client.equipments.forEach(equip => {
      equip.visits.forEach(visit => {
        allVisits.push({
          ...visit,
          clientName: client.name,
          equipmentName: equip.productName,
          locationInfo: equip.executionSite || equip.location || client.locality
        });
      });
    });
  });

  // Filter visits for current month and year of the viewDate
  const filteredVisits = allVisits
    .filter(v => {
      const vDate = new Date(v.date);
      return vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Header with Navigation */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">
              {monthName} <span className="text-blue-600">{currentYear}</span>
            </h2>
            <p className="text-slate-500 text-sm">Agenda Mensal de Manutenções</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={resetToToday}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors"
          >
            Hoje
          </button>

          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {filteredVisits.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
            <div className="relative mb-4">
              <CalendarIcon className="w-20 h-20 opacity-5" />
              <Clock className="w-8 h-8 absolute bottom-0 right-0 opacity-20" />
            </div>
            <p className="text-lg font-medium">Sem intervenções em {monthName}.</p>
            <p className="text-sm">Utilize os botões de navegação para consultar outros períodos.</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Data Planeada</th>
                  <th className="px-6 py-4">Serviço / Técnico</th>
                  <th className="px-6 py-4">Cliente / Local de Execução</th>
                  <th className="px-6 py-4">Notas Técnicas</th>
                  <th className="px-6 py-4 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{formatDatePT(visit.date)}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono tracking-tighter">REF: {visit.id.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold w-fit uppercase border ${
                          visit.type === 'Reconstrução' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {visit.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          {visit.technician}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                          <Building className="w-3.5 h-3.5 text-blue-500" />
                          {visit.clientName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          {visit.locationInfo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 line-clamp-2 italic" title={visit.notes}>
                        "{visit.notes}"
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-slate-300 group-hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver Detalhes">
                         <ExternalLink className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row gap-4">
         <div className="flex-1 bg-blue-900 p-4 rounded-xl text-white flex items-center gap-4 shadow-lg shadow-blue-900/10">
            <div className="p-2 bg-blue-800 rounded-lg">
               <CalendarIcon className="w-5 h-5 text-blue-300" />
            </div>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Total Mensal</p>
               <p className="text-lg font-black">{filteredVisits.length} Intervenções Registadas</p>
            </div>
         </div>
         <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
               <Clock className="w-5 h-5" />
            </div>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Status do Mês</p>
               <p className="text-sm font-medium text-slate-600">A exibir dados de {monthName} {currentYear}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AgendaView;