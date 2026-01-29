import React, { useState, useEffect } from 'react';
import { VisitType, Equipment, Visit, Attachment } from '../types';
import { X, Upload, Calendar, User, FileText, Activity, Edit, Trash2, Download } from 'lucide-react';

interface VisitModalProps {
  initialData?: Visit;
  equipment: Equipment;
  onClose: () => void;
  onSave: (visitData: any) => void;
  onDelete?: (visitId: string) => void;
}

const VisitModal: React.FC<VisitModalProps> = ({ initialData, equipment, onClose, onSave, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<VisitType>(VisitType.ASSIST_LIGHT);
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [newViewerSerial, setNewViewerSerial] = useState('');
  
  // existingFiles stores Attachment objects (name, url)
  const [existingFiles, setExistingFiles] = useState<Attachment[]>([]);
  // newFiles stores File objects from input
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setType(initialData.type);
      setTechnician(initialData.technician);
      setNotes(initialData.notes);
      setNewViewerSerial(initialData.newViewerSerial || '');
      setExistingFiles(initialData.files || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process new files into Attachments with Object URLs
    const processedNewFiles: Attachment[] = newFiles.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type
    }));

    const finalFiles = [...existingFiles, ...processedNewFiles];

    onSave({
      id: initialData?.id,
      date,
      type,
      technician,
      notes,
      files: finalFiles,
      viewerChanged: type === VisitType.RECONSTRUCTION,
      newViewerSerial: type === VisitType.RECONSTRUCTION ? newViewerSerial : undefined
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {initialData ? <Edit className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            {initialData ? 'Editar Visita' : 'Registar Visita / Intervenção'}
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Visita</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VisitType)}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(VisitType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Técnico Responsável</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Nome do técnico"
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {type === VisitType.RECONSTRUCTION && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Dados da Reconstrução</h4>
              <p className="text-xs text-amber-700 mb-3">
                A visita de reconstrução implica calibração e substituição do visor. Indique o novo serial.
              </p>
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                  Novo Nº Série Visor
                </label>
                <input
                  type="text"
                  required
                  value={newViewerSerial}
                  onChange={(e) => setNewViewerSerial(e.target.value)}
                  placeholder="Ex: DD-9921-NEW"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Relatório / Observações</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Descreva o trabalho realizado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Anexos (Certificados, Fotos)</label>
            <div className="flex items-center justify-center w-full mb-3">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold">Clique para carregar</span>
                  </p>
                  <p className="text-xs text-slate-400">PDF, JPG, PNG</p>
                </div>
                <input type="file" className="hidden" multiple onChange={handleFileChange} />
              </label>
            </div>
            
            {(existingFiles.length > 0 || newFiles.length > 0) && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {existingFiles.map((f, i) => (
                  <div key={`ex-${i}`} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-100">
                    <div className="flex items-center text-slate-600 truncate">
                      <FileText className="w-3 h-3 mr-2 text-blue-500" /> 
                      <span className="truncate max-w-[150px]">{f.name}</span>
                    </div>
                    <div className="flex gap-2">
                        {f.url && (
                            <a href={f.url} download={f.name} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Descarregar">
                                <Download className="w-3 h-3" />
                            </a>
                        )}
                        <button type="button" onClick={() => removeExistingFile(i)} className="text-red-500 hover:text-red-700">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                  </div>
                ))}
                {newFiles.map((f, i) => (
                  <div key={`new-${i}`} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-100">
                    <div className="flex items-center text-slate-600 truncate">
                      <FileText className="w-3 h-3 mr-2 text-green-500" /> 
                      <span className="truncate max-w-[150px]">{f.name}</span>
                      <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1 rounded">Novo</span>
                    </div>
                    <button type="button" onClick={() => removeNewFile(i)} className="text-red-500 hover:text-red-700">
                        <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-between gap-3">
             {initialData && onDelete ? (
                <button
                    type="button"
                    onClick={() => onDelete(initialData.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Apagar
                </button>
             ) : (
                <div></div> // Spacer
             )}
            <div className="flex gap-3">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                Cancelar
                </button>
                <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                {initialData ? 'Guardar Alterações' : 'Registar Visita'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitModal;