import React, { useState, useEffect } from 'react';
import { X, Scale, FileText, Edit, CheckCircle, RefreshCw, Upload, File as FileIcon, Paperclip, AlignLeft, MapPin, Map } from 'lucide-react';
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
    description: '',
    // Technical Location Fields
    geoGrid: '',
    deliveryAddress: '',
    locality: '',
    municipality: '',
    district: '',
    executionSite: '',
    
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
  const [renewalFile, setRenewalFile] = useState<Attachment | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName,
        location: initialData.location,
        weightCapacity: initialData.weightCapacity,
        loadCells: initialData.loadCells || '',
        description: initialData.description || '',
        geoGrid: initialData.geoGrid || '',
        deliveryAddress: initialData.deliveryAddress || '',
        locality: initialData.locality || '',
        municipality: initialData.municipality || '',
        district: initialData.district || '',
        executionSite: initialData.executionSite || '',
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
      if (initialData.contract?.contractFile) setContractFile(initialData.contract.contractFile);
      if (initialData.contract?.renewalFile) setRenewalFile(initialData.contract.renewalFile);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isRenewal: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const attachment: Attachment = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      };
      if (isRenewal) setRenewalFile(attachment);
      else setContractFile(attachment);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, contractFile, renewalFile });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {initialData ? <Edit className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            {initialData ? 'Editar Equipamento/Contrato' : 'Adicionar Equipamento Técnico'}
          </h3>
          <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
          
          {/* SECTION 1: IDENTIFICATION & SPECS */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
               <Scale className="w-4 h-4" /> Dados Técnicos do Equipamento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">TIPO EQUIPAMENTO</label>
                <input
                  required
                  placeholder="Ex: Báscula Ponte 18m"
                  value={formData.productName}
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">CAPACIDADE CE</label>
                <input
                  required
                  placeholder="Ex: 60 Ton"
                  value={formData.weightCapacity}
                  onChange={e => setFormData({...formData, weightCapacity: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nº SÉRIE EQUIPAMENTO</label>
                <input
                  required
                  value={formData.equipmentSerial}
                  onChange={e => setFormData({...formData, equipmentSerial: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">VISOR</label>
                <input
                  required
                  placeholder="Modelo do Visor"
                  value={formData.viewerModel}
                  onChange={e => setFormData({...formData, viewerModel: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nº SÉRIE VISOR</label>
                <input
                  required
                  value={formData.viewerSerial}
                  onChange={e => setFormData({...formData, viewerSerial: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1">CÉLULA DE CARGA</label>
                <input
                  placeholder="Ex: (8) Giropes G8R Digital"
                  value={formData.loadCells}
                  onChange={e => setFormData({...formData, loadCells: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1">DESCRIÇÃO DO SERVIÇO / EQUIPAMENTO</label>
                <textarea
                  placeholder="Descrição detalhada para o técnico..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION DETAILS */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
               <MapPin className="w-4 h-4" /> Detalhes de Localização
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">MORADA DE ENTREGA</label>
                <input
                  value={formData.deliveryAddress}
                  onChange={e => setFormData({...formData, deliveryAddress: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">LOCALIDADE</label>
                <input
                  value={formData.locality}
                  onChange={e => setFormData({...formData, locality: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">CONCELHO</label>
                <input
                  value={formData.municipality}
                  onChange={e => setFormData({...formData, municipality: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">DISTRITO</label>
                <input
                  value={formData.district}
                  onChange={e => setFormData({...formData, district: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                   <Map className="w-3 h-3" /> LOCALIZAÇÃO GEOGRÁFICA (Coordenadas)
                </label>
                <input
                  placeholder="Ex: 38.7223, -9.1393"
                  value={formData.geoGrid}
                  onChange={e => setFormData({...formData, geoGrid: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">LOCAL DE EXECUÇÃO CONSOLIDADO</label>
                <input
                  placeholder="Nome do local de trabalho (ex: Cais 4)"
                  value={formData.executionSite}
                  onChange={e => setFormData({...formData, executionSite: e.target.value})}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTRACT & VISITS */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Gestão de Visitas de Contrato
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-800 mb-1">VISITA LIGEIRO</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalLightVisits}
                  onChange={e => setFormData({...formData, totalLightVisits: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-800 mb-1">VISITA PESADO</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalTruckVisits}
                  onChange={e => setFormData({...formData, totalTruckVisits: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-blue-800 mb-1">Nº FATURA / CONTRATO</label>
                <input
                  placeholder="FCM / Fatura"
                  value={formData.contractInvoice}
                  onChange={e => setFormData({...formData, contractInvoice: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-blue-800 mb-1">INÍCIO CONTRATO</label>
                <input
                  type="date"
                  value={formData.contractStartDate}
                  onChange={e => setFormData({...formData, contractStartDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded text-sm outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-blue-800 mb-1">FIM CONTRATO</label>
                <input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={e => setFormData({...formData, contractEndDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black shadow-lg transition-all"
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