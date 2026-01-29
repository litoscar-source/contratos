import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, Check } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Client, Equipment, EquipmentType, VisitType } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (clients: Client[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<{ clients: number, equipments: number } | null>(null);
  const [parsedData, setParsedData] = useState<Client[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setStats(null);
      setParsedData(null);
    }
  };

  const parseDate = (dateStr: any): string => {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    
    // Handle excel/csv formats like DD/MM/YYYY or DD-MM-YYYY
    try {
        const parts = str.split(/[-/]/);
        if (parts.length === 3) {
            // Assume DD/MM/YYYY if first part is > 12 or if year is last
            if (parts[2].length === 4) {
                 return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            // If format is YYYY-MM-DD (standard), return as is
            if (parts[0].length === 4) {
                 return str;
            }
        }
        // Try native Date parsing for other formats
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return ''; 
    } catch {
        return '';
    }
  };

  const mapEquipmentType = (typeStr: string): EquipmentType => {
      if (!typeStr) return EquipmentType.Other;
      const lower = String(typeStr).toLowerCase();
      if (lower.includes('pcm') || lower.includes('ponte') || lower.includes('bascula')) return EquipmentType.PCM;
      if (lower.includes('pvs') || lower.includes('silo')) return EquipmentType.PVS;
      if (lower.includes('pvm') || lower.includes('movel')) return EquipmentType.PVM;
      return EquipmentType.Other;
  };

  const normalizeHeaders = (row: any): any => {
      const newRow: any = {};
      Object.keys(row).forEach(key => {
          let cleanKey = key.toString();
          // Replace newlines (\n, \r) and multiple spaces with a single space
          cleanKey = cleanKey.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
          // Remove surrounding quotes if they exist (common in CSV/Excel copy-paste)
          cleanKey = cleanKey.replace(/^"|"$/g, '');
          newRow[cleanKey] = row[key];
      });
      return newRow;
  };

  const processData = (rawData: any[]) => {
      try {
        const rows = rawData.map(normalizeHeaders);
        const clientsMap = new Map<string, Client>();

        rows.forEach((row, index) => {
            const clientName = row['CLIENTE'];
            if (!clientName) return; 

            // Normalize Client
            let client = clientsMap.get(clientName);
            if (!client) {
                // Construct Address from columns: MORADA DE ENTREGA, LOCALIDADE, CONCELHO, DISTRITO
                const addressParts = [
                    row['MORADA DE ENTREGA'], 
                    row['LOCALIDADE'], 
                    row['CONCELHO'], 
                    row['DISTRITO']
                ].filter(val => val && String(val).trim() !== '');

                client = {
                    id: `import-c-${Date.now()}-${index}`,
                    name: clientName,
                    address: addressParts.join(', ') || 'Morada desconhecida',
                    contactPerson: 'Não especificado', // Not in file
                    email: '', // Not in file
                    phone: '', // Not in file
                    equipments: []
                };
                clientsMap.set(clientName, client);
            }

            // Construct Equipment
            const startDate = parseDate(row['DATA INICIO CONTRATO']);
            const endDate = parseDate(row['DATA FIM CONTRATO']);
            const installDate = startDate || new Date().toISOString().split('T')[0]; 
            
            // Determine Payment
            // If PAGO has a date (e.g. 06/11/2025), it is paid on that date.
            // If PAGO has "Sim", it is paid.
            const pagoVal = String(row['PAGO'] || '').trim();
            let isPaid = false;
            let paymentDate = '';

            if (pagoVal) {
                const asDate = parseDate(pagoVal);
                if (asDate) {
                    isPaid = true;
                    paymentDate = asDate;
                } else if (['sim', 'yes', '1', 'pago'].includes(pagoVal.toLowerCase())) {
                    isPaid = true;
                }
            }

            // Determine Serial
            const equipSerial = row['NÚMERO DE SÉRIE EQUIPAMENTO'] || 'N/A';
            const loadCells = row['CÉLULA DE CARGA'] || '';

            const equipment: Equipment = {
                id: `import-e-${Date.now()}-${index}`,
                clientId: client.id,
                location: row['Local de Execução consolidado'] || row['Localização geográfica'] || row['MORADA DE ENTREGA'] || '',
                productName: row['TIPO EQUIPAMENTO'] || 'Equipamento',
                weightCapacity: row['CAPACIDADE CE'] || row['CAPACIDADE'] || '',
                loadCells: loadCells,
                installDate: installDate,
                type: mapEquipmentType(row['TIPO EQUIPAMENTO']),
                equipmentSerial: equipSerial,
                viewerModel: row['VISOR'] || '',
                viewerSerial: row['NÚMERO DE SÉRIE VISOR'] || '',
                visits: [],
                contract: {
                    id: `import-ctr-${Date.now()}-${index}`,
                    equipmentId: `import-e-${Date.now()}-${index}`,
                    startDate: startDate || new Date().toISOString().split('T')[0],
                    endDate: endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    invoiceNumber: row['FCM'] || '', // Mapping FCM to Invoice Number
                    isPaid: isPaid,
                    paymentDate: paymentDate || undefined,
                    totalLightVisits: parseInt(row['VISITA LIGEIRO']) || 0,
                    usedLightVisits: 0,
                    totalTruckVisits: parseInt(row['VISITA PESADO']) || 0,
                    usedTruckVisits: 0,
                    renewed: false
                }
            };

            // Add historical visit if "ULTIMA VISITA CE" exists
            const lastVisitDate = parseDate(row['ULTIMA VISITA CE']);
            if (lastVisitDate) {
                equipment.visits.push({
                    id: `import-v-${Date.now()}-${index}`,
                    equipmentId: equipment.id,
                    date: lastVisitDate,
                    type: VisitType.RECONSTRUCTION, // Assuming CE check implies a reconstruction/calibration event
                    technician: 'Histórico Importado',
                    notes: 'Última Visita CE (Dados Importados)',
                    files: []
                });
            }

            client.equipments.push(equipment);
        });

        const clientsArray = Array.from(clientsMap.values());
        setParsedData(clientsArray);
        setStats({
            clients: clientsArray.length,
            equipments: clientsArray.reduce((acc, c) => acc + c.equipments.length, 0)
        });
      } catch (err) {
          console.error("Processing Error", err);
          setError("Erro ao processar os dados do ficheiro.");
      }
  };

  const handleParse = () => {
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'csv') {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            // Custom transform header not strictly needed if we use normalizeHeaders later, 
            // but good for initial cleanup
            transformHeader: (h) => h.trim().replace(/"/g, ''),
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.warn("CSV Errors:", results.errors);
                }
                processData(results.data as any[]);
            },
            error: (err) => {
                setError(`Erro CSV: ${err.message}`);
            }
        });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // IMPORTANT: raw: false forces parsing dates as formatted text (e.g. "06/11/2025")
                // which matches our parseDate logic for DD/MM/YYYY
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
                processData(jsonData);
            } catch (err) {
                console.error("Excel Parse Error", err);
                setError("Erro ao ler ficheiro Excel.");
            }
        };
        reader.onerror = () => setError("Erro ao ler o ficheiro.");
        reader.readAsArrayBuffer(file);
    } else {
        setError("Formato de ficheiro não suportado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Dados (Excel/CSV)
          </h3>
          <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
            {!stats ? (
                <>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                        <input 
                            type="file" 
                            accept=".csv, .xlsx, .xls" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            id="csvInput"
                        />
                        <label htmlFor="csvInput" className="cursor-pointer flex flex-col items-center">
                            <Upload className="w-10 h-10 text-emerald-500 mb-2" />
                            <span className="text-sm font-medium text-slate-700">Clique para selecionar ficheiro</span>
                            <span className="text-xs text-slate-400 mt-1">Formatos suportados: .xlsx, .xls, .csv</span>
                        </label>
                    </div>
                    {file && (
                        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 p-2 rounded">
                            <FileSpreadsheet className="w-4 h-4" />
                            {file.name}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleParse}
                        disabled={!file}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        Analisar Ficheiro
                    </button>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Análise Concluída
                        </h4>
                        <ul className="space-y-1 text-sm text-emerald-800">
                            <li>• {stats.clients} Clientes encontrados</li>
                            <li>• {stats.equipments} Equipamentos encontrados</li>
                        </ul>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setStats(null); setFile(null); }}
                            className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={() => parsedData && onImport(parsedData)}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Confirmar Importação
                        </button>
                    </div>
                </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                <p>O sistema processará colunas como: CLIENTE, MORADA DE ENTREGA, TIPO EQUIPAMENTO, CAPACIDADE CE, PAGO, DATA INICIO CONTRATO, etc.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;