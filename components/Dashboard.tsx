import React, { useState } from 'react';
import { Client, Equipment, VisitType, formatDatePT } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Wrench, Clock, ChevronRight, X, ClipboardCheck } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
}

type FilterType = 'ALL' | 'PENDING_PAYMENT' | 'EXPIRED' | 'PENDING_RECONSTRUCTION';

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const today = new Date();
  const allEquipments = clients.flatMap(c => c.equipments.map(e => ({ ...e, clientName: c.name })));

  // 1. Total Equipments
  const totalEquipments = allEquipments.length;
  
  // 2. Unpaid Contracts
  const unpaidContracts = allEquipments.filter(e => e.contract && !e.contract.isPaid).length;
  
  // 3. Expired Contracts
  const expiredContracts = allEquipments.filter(e => 
    e.contract && new Date(e.contract.endDate) < today
  ).length;

  // 4. Pending Reconstruction (Paid, Active, but no Reconstruction Visit)
  const pendingReconstructionEquips = allEquipments.filter(e => {
      if (!e.contract) return false;
      const isPaid = e.contract.isPaid;
      const isActive = new Date(e.contract.startDate) <= today && new Date(e.contract.endDate) >= today;
      const hasReconstruction = e.visits.some(v => v.type === VisitType.RECONSTRUCTION);
      return isPaid && isActive && !hasReconstruction;
  });
  const pendingReconstructionCount = pendingReconstructionEquips.length;

  const totalVisits = allEquipments.reduce((acc, e) => acc + e.visits.length, 0);

  const contractData = [
    { name: 'Pagos', value: allEquipments.filter(e => e.contract?.isPaid).length, color: '#22c55e' },
    { name: 'Pendentes', value: unpaidContracts, color: '#ef4444' },
    { name: 'Expirados', value: expiredContracts, color: '#f59e0b' },
  ];

  const activityData = [
    { name: 'Jan', reconstrucoes: 2, assistencias: 5 },
    { name: 'Fev', reconstrucoes: 1, assistencias: 3 },
    { name: 'Mar', reconstrucoes: 3, assistencias: 6 },
    { name: 'Abr', reconstrucoes: 0, assistencias: 4 },
    { name: 'Mai', reconstrucoes: 4, assistencias: 8 },
  ];

  // Filter Logic for the detail table
  const getFilteredData = () => {
      if (activeFilter === 'PENDING_PAYMENT') return allEquipments.filter(e => e.contract && !e.contract.isPaid);
      if (activeFilter === 'EXPIRED') return allEquipments.filter(e => e.contract && new Date(e.contract.endDate) < today);
      if (activeFilter === 'PENDING_RECONSTRUCTION') return pendingReconstructionEquips;
      return [];
  };

  const filteredEquipments = getFilteredData();

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 pb-10 animate-in fade-in duration-500">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          onClick={() => setActiveFilter(activeFilter === 'PENDING_PAYMENT' ? 'ALL' : 'PENDING_PAYMENT')}
          isActive={activeFilter === 'PENDING_PAYMENT'}
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
          title="Reconstrução Pendente" 
          value={pendingReconstructionCount} 
          icon={<ClipboardCheck className="text-purple-600" />} 
          bg="bg-purple-50"
          onClick={() => setActiveFilter(activeFilter === 'PENDING_RECONSTRUCTION' ? 'ALL' : 'PENDING_RECONSTRUCTION')}
          isActive={activeFilter === 'PENDING_RECONSTRUCTION'}
          subtitle="Pagos e ativos s/ visita"
        />
      </div>

      {/* Filtered List Table */}
      {activeFilter !== 'ALL' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <div className={`p-4 border-b flex justify-between items-center ${
                  activeFilter === 'PENDING_PAYMENT' ? 'bg-red-50 border-red-100' : 
                  activeFilter === 'EXPIRED' ? 'bg-amber-50 border-amber-100' : 
                  'bg-purple-50 border-purple-100'
              }`}>
                  <h3 className={`font-bold flex items-center gap-2 ${
                      activeFilter === 'PENDING_PAYMENT' ? 'text-red-800' : 
                      activeFilter === 'EXPIRED' ? 'text-amber-800' : 
                      'text-purple-800'
                  }`}>
                      {activeFilter === 'PENDING_PAYMENT' && <AlertTriangle className="w-4 h-4" />}
                      {activeFilter === 'EXPIRED' && <Clock className="w-4 h-4" />}
                      {activeFilter === 'PENDING_RECONSTRUCTION' && <Wrench className="w-4 h-4" />}
                      
                      {activeFilter === 'PENDING_PAYMENT' && 'Equipamentos com Pagamento Pendente'}
                      {activeFilter === 'EXPIRED' && 'Contratos Expirados'}
                      {activeFilter === 'PENDING_RECONSTRUCTION' && 'Reconstruções Pendentes (Contratos Ativos e Pagos)'}
                  </h3>
                  <button onClick={() => setActiveFilter('ALL')} className="p-1 hover:bg-white/50 rounded-full text-slate-500 transition-colors">
                      <X className="w-4 h-4" />
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                          <tr>
                              <th className="px-6 py-4">Cliente</th>
                              <th className="px-6 py-4">Equipamento</th>
                              <th className="px-6 py-4">Contrato / Fatura</th>
                              <th className="px-6 py-4">Válido Até</th>
                              <th className="px-6 py-4 text-center">Estado</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredEquipments.map((e, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-slate-800">{e.clientName}</td>
                                  <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                          <span className="text-slate-700 font-medium">{e.productName}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">{e.equipmentSerial}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-600 font-mono">{e.contract?.invoiceNumber || '-'}</td>
                                  <td className="px-6 py-4">
                                      <span className={`font-medium ${new Date(e.contract?.endDate || '') < today ? 'text-red-500' : 'text-slate-700'}`}>
                                          {formatDatePT(e.contract?.endDate)}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      {activeFilter === 'PENDING_PAYMENT' && <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] rounded font-bold border border-red-200 uppercase">Não Pago</span>}
                                      {activeFilter === 'EXPIRED' && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] rounded font-bold border border-amber-200 uppercase">Expirado</span>}
                                      {activeFilter === 'PENDING_RECONSTRUCTION' && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] rounded font-bold border border-purple-200 uppercase">Visita em Falta</span>}
                                  </td>
                              </tr>
                          ))}
                          {filteredEquipments.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum registo encontrado para este filtro.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Estado Financeiro dos Contratos
          </h3>
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
          <div className="flex justify-center gap-6 mt-2 flex-wrap">
            {contractData.map(d => (
              <div key={d.name} className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Histórico de Atividade (Amostra)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="reconstrucoes" name="Reconstruções" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assistencias" name="Assistências" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg, onClick, isActive, subtitle }: { title: string, value: number, icon: React.ReactNode, bg: string, onClick?: () => void, isActive?: boolean, subtitle?: string }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-xl shadow-sm border transition-all duration-300 flex items-center justify-between group ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
    } ${
        isActive ? 'ring-2 ring-offset-2 ring-blue-500 border-blue-500' : 'border-slate-200'
    }`}
  >
    <div className="flex-1">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-slate-600 transition-colors">{title}</p>
      <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
      </div>
    </div>
    <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${bg}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
  </div>
);

export default Dashboard;