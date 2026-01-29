import React, { useState } from 'react';
import { Client, Equipment, formatDatePT } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Wrench, Clock, ChevronRight, X } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
}

type FilterType = 'ALL' | 'PENDING' | 'EXPIRED';

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Calculated stats
  const totalEquipments = clients.reduce((acc, c) => acc + c.equipments.length, 0);
  
  const allEquipments = clients.flatMap(c => c.equipments.map(e => ({ ...e, clientName: c.name })));
  const paidContracts = allEquipments.filter(e => e.contract?.isPaid).length;
  const unpaidContracts = allEquipments.filter(e => e.contract && !e.contract.isPaid).length;
  
  // Contracts that have passed their end date
  const today = new Date();
  const expiredContracts = allEquipments.filter(e => 
    e.contract && new Date(e.contract.endDate) < today
  ).length;

  const totalVisits = clients.reduce((acc, c) => 
    acc + c.equipments.reduce((vAcc, e) => vAcc + e.visits.length, 0), 0
  );

  const contractData = [
    { name: 'Pagos', value: paidContracts, color: '#22c55e' },
    { name: 'Pendentes', value: unpaidContracts, color: '#ef4444' },
    { name: 'Expirados', value: expiredContracts, color: '#f59e0b' },
  ];

  // Mock monthly data derived from install dates (just for visualization)
  const activityData = [
    { name: 'Jan', reconstrucoes: 2, assistencias: 5 },
    { name: 'Fev', reconstrucoes: 1, assistencias: 3 },
    { name: 'Mar', reconstrucoes: 3, assistencias: 6 },
    { name: 'Abr', reconstrucoes: 0, assistencias: 4 },
    { name: 'Mai', reconstrucoes: 4, assistencias: 8 },
  ];

  // Filter Logic
  const filteredEquipments = allEquipments.filter(e => {
      if (activeFilter === 'PENDING') return e.contract && !e.contract.isPaid;
      if (activeFilter === 'EXPIRED') return e.contract && new Date(e.contract.endDate) < today;
      return false;
  });

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Equipamentos" 
          value={totalEquipments} 
          icon={<TrendingUp className="text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Pagamento Pendente" 
          value={unpaidContracts} 
          icon={<AlertTriangle className="text-red-600" />} 
          bg="bg-red-50"
          onClick={() => setActiveFilter(activeFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          isActive={activeFilter === 'PENDING'}
        />
        <StatCard 
          title="Contratos Expirados" 
          value={expiredContracts} 
          icon={<Clock className="text-amber-600" />} 
          bg="bg-amber-50"
          onClick={() => setActiveFilter(activeFilter === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          isActive={activeFilter === 'EXPIRED'}
        />
         <StatCard 
          title="Total Intervenções" 
          value={totalVisits} 
          icon={<Wrench className="text-slate-600" />} 
          bg="bg-slate-100"
        />
      </div>

      {activeFilter !== 'ALL' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {activeFilter === 'PENDING' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                      {activeFilter === 'PENDING' ? 'Equipamentos com Pagamento Pendente' : 'Contratos Expirados'}
                  </h3>
                  <button onClick={() => setActiveFilter('ALL')} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                      <X className="w-4 h-4" />
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                          <tr>
                              <th className="px-4 py-3">Cliente</th>
                              <th className="px-4 py-3">Equipamento</th>
                              <th className="px-4 py-3">Contrato / Fatura</th>
                              <th className="px-4 py-3">Data Fim</th>
                              <th className="px-4 py-3">Estado</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredEquipments.map((e, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-medium text-slate-800">{e.clientName}</td>
                                  <td className="px-4 py-3 text-slate-600">{e.productName} <span className="text-slate-400 text-xs">({e.location})</span></td>
                                  <td className="px-4 py-3 text-slate-600">{e.contract?.invoiceNumber || '-'}</td>
                                  <td className="px-4 py-3 text-slate-600">{formatDatePT(e.contract?.endDate)}</td>
                                  <td className="px-4 py-3">
                                      {activeFilter === 'PENDING' && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">Não Pago</span>}
                                      {activeFilter === 'EXPIRED' && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">Expirado</span>}
                                  </td>
                              </tr>
                          ))}
                          {filteredEquipments.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Nenhum registo encontrado.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Estado dos Contratos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contractData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {contractData.map(d => (
              <div key={d.name} className="flex items-center text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Atividade Recente</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="reconstrucoes" name="Reconstruções" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assistencias" name="Assistências" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg, onClick, isActive }: { title: string, value: number, icon: React.ReactNode, bg: string, onClick?: () => void, isActive?: boolean }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 flex items-center justify-between ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''} ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'}`}
  >
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${bg}`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;