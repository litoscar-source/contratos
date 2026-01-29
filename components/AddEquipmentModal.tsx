import React, { useState, useEffect } from 'react';
import { X, Scale, FileText, Edit, CheckCircle, RefreshCw, Upload, File as FileIcon } from 'lucide-react';
import { EquipmentType, Equipment, Attachment } from '../types';

interface AddEquipmentModalProps {
  initialData?: Equipment;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    productName: '',
    location: '',
    weightCapacity: '',
    loadCells: '',
    installDate: new Date().toISOString().split('T')[0],
    type: EquipmentType.PCM,
    equipmentSerial: '',
    viewerModel: '',
    viewerSerial: '',
    // Contract Data
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    contractInvoice: '',
    totalLightVisits: 0,
    totalTruckVisits: 0,
    isPaid: false,
    renewed: false,
    renewalDate: ''
  });

  const [contractFile, setContractFile] = useState<Attachment | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName,
        location: initialData.location,
        weightCapacity: initialData.weightCapacity,
        loadCells: initialData.loadCells || '',
        installDate: initialData.installDate,
        type: initialData.type,
        equipmentSerial: initialData.equipmentSerial,
        viewerModel: initialData.viewerModel,
        viewerSerial: initialData.viewerSerial,
        contractStartDate: initialData.contract?.startDate || new Date().toISOString().split('T')[0],
        contractEndDate: initialData.contract?.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        contractInvoice: initialData.contract?.invoiceNumber || '',
        totalLightVisits: initialData.contract?.totalLightVisits || 0,
        totalTruckVisits: initialData.contract?.totalTruckVisits || 0,
        isPaid: initialData.contract?.isPaid || false,
        renewed: initialData.contract?.renewed || false,
        renewalDate: initialData.contract?.renewalDate || ''
      });
      if (initialData.contract?.contractFile) {
        setContractFile(initialData.contract.contractFile);
      }
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContractFile({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, contractFile });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {initialData ? <Edit className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            {initialData ? 'Editar Equipamento/Contrato' : 'Adicionar Equipamento e Contrato'}
          </h3>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Equipment Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">
              Dados do Equipamento
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Produto</label>
                <input
                  required
                  placeholder="Ex: Báscula Ponte 18m"
                  value={formData.productName}
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Localização</label>
                <input
                  required
                  placeholder="Ex: Armazém B"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Capacidade</label>
                <input
                  required
                  placeholder="Ex: 60 Ton"
                  value={formData.weightCapacity}
                  onChange={e => setFormData({...formData, weightCapacity: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Células de Carga</label>
                <input
                  placeholder="Ex: (8) Giropes G8R"
                  value={formData.loadCells}
                  onChange={e => setFormData({...formData, loadCells: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Data Instalação</label>
                <input
                  type="date"
                  required
                  value={formData.installDate}
                  onChange={e => setFormData({...formData, installDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as EquipmentType})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(EquipmentType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nº Série Equipamento</label>
                <input
                  required
                  value={formData.equipmentSerial}
                  onChange={e => setFormData({...formData, equipmentSerial: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Modelo Visor</label>
                <input
                  required
                  value={formData.viewerModel}
                  onChange={e => setFormData({...formData, viewerModel: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nº Série Visor</label>
                <input
                  required
                  value={formData.viewerSerial}
                  onChange={e => setFormData({...formData, viewerSerial: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Dados do Contrato
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-800 mb-1">Início Contrato</label>
                <input
                  type="date"
                  required
                  value={formData.contractStartDate}
                  onChange={e => setFormData({...formData, contractStartDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-800 mb-1">Fim Contrato</label>
                <input
                  type="date"
                  required
                  value={formData.contractEndDate}
                  onChange={e => setFormData({...formData, contractEndDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-blue-800 mb-1">Nº Fatura / Contrato</label>
                <input
                  required
                  placeholder="Ex: FT 2024/000"
                  value={formData.contractInvoice}
                  onChange={e => setFormData({...formData, contractInvoice: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

               {/* File Upload for Contract PDF */}
               <div className="col-span-2">
                  <label className="block text-xs font-medium text-blue-800 mb-1">Contrato Digital (PDF)</label>
                  <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors text-blue-700 text-xs font-medium">
                          <Upload className="w-4 h-4" />
                          Carregar PDF
                          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                      </label>
                      {contractFile && (
                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 text-xs">
                              <FileIcon className="w-3 h-3 text-blue-500" />
                              <span className="truncate max-w-[150px]">{contractFile.name}</span>
                              <button 
                                  type="button" 
                                  onClick={() => setContractFile(undefined)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                              >
                                  <X className="w-3 h-3" />
                              </button>
                          </div>
                      )}
                  </div>
              </div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                <div>
                   <label className="block text-xs font-bold text-blue-900 mb-1">Visitas Ligeiro (Total)</label>
                   <input
                    type="number"
                    min="0"
                    value={formData.totalLightVisits}
                    onChange={e => setFormData({...formData, totalLightVisits: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-blue-900 mb-1">Visitas Camião (Total)</label>
                   <input
                    type="number"
                    min="0"
                    value={formData.totalTruckVisits}
                    onChange={e => setFormData({...formData, totalTruckVisits: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
              </div>

              {/* Status and Renewal */}
              <div className="col-span-2 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-100">
                    <input 
                      type="checkbox"
                      id="isPaid"
                      checked={formData.isPaid}
                      onChange={e => setFormData({...formData, isPaid: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPaid" className="text-sm font-medium text-slate-700 flex items-center gap-1 cursor-pointer">
                      <CheckCircle className={`w-4 h-4 ${formData.isPaid ? 'text-green-500' : 'text-slate-300'}`} />
                      Contrato Pago
                    </label>
                 </div>
                 
                 <div className="flex flex-col gap-2 p-2 bg-white rounded border border-blue-100">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="renewed"
                        checked={formData.renewed}
                        onChange={e => setFormData({...formData, renewed: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="renewed" className="text-sm font-medium text-slate-700 flex items-center gap-1 cursor-pointer">
                        <RefreshCw className={`w-4 h-4 ${formData.renewed ? 'text-blue-500' : 'text-slate-300'}`} />
                        Contrato Renovado
                      </label>
                    </div>
                    
                    {formData.renewed && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs text-slate-500 mb-1 ml-6">Data de Renovação</label>
                        <input
                          type="date"
                          value={formData.renewalDate}
                          onChange={e => setFormData({...formData, renewalDate: e.target.value})}
                          className="w-full ml-6 px-2 py-1 bg-slate-50 text-slate-900 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none max-w-[150px]"
                        />
                      </div>
                    )}
                 </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 shadow-md"
            >
              {initialData ? 'Guardar Alterações' : 'Adicionar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal;