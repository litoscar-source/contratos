import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, Check, HelpCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Client, Equipment, EquipmentType } from '../types';

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

  // Helper: Limpa strings para comparação (remove acentos, espaços extra, upper case)
  const normalizeHeader = (str: any): string => {
    if (!str) return '';
    return String(str)
      .toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^A-Z0-9]/g, ""); // Remove tudo que não for letra ou número
  };

  const parseDate = (dateStr: any): string => {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    try {
        // Excel serial date
        if (!isNaN(Number(str)) && Number(str) > 20000) {
            const excelDate = new Date((Number(str) - (25567 + 2)) * 86400 * 1000);
            return excelDate.toISOString().split('T')[0];
        }

        const parts = str.split(/[-/]/);
        if (parts.length === 3) {
            const p1 = parseInt(parts[0]);
            const p2 = parseInt(parts[1]);
            const p3 = parseInt(parts[2]);
            if (p3 > 1000) return `${p3}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`; // DD-MM-YYYY
            if (p1 > 1000) return `${p1}-${String(p2).padStart(2, '0')}-${String(p3).padStart(2, '0')}`; // YYYY-MM-DD
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

  const processData = (rawData: any[][]) => {
      try {
        if (!rawData || rawData.length === 0) {
            setError("O ficheiro está vazio.");
            return;
        }

        // 1. Encontrar a linha de cabeçalho (Score based)
        // Procuramos palavras-chave essenciais. A linha com mais matches vence.
        const keywords = ['CLIENTE', 'MORADA', 'EQUIPAMENTO', 'VISOR', 'CAPACIDADE', 'CONTRATO', 'DATA'];
        
        let headerRowIndex = -1;
        let maxMatches = 0;

        for (let i = 0; i < Math.min(rawData.length, 25); i++) {
            const rowStr = rawData[i].map(normalizeHeader).join(' ');
            let matches = 0;
            keywords.forEach(kw => {
                if (rowStr.includes(kw)) matches++;
            });

            if (matches > maxMatches) {
                maxMatches = matches;
                headerRowIndex = i;
            }
        }

        if (headerRowIndex === -1 || maxMatches < 2) {
            setError("Não foi possível identificar a linha de cabeçalho. Verifique se o Excel tem colunas como 'CLIENTE', 'MORADA', 'EQUIPAMENTO'.");
            return;
        }

        // 2. Mapear Índices das Colunas
        const headerRow = rawData[headerRowIndex].map(normalizeHeader);
        const colMap: Record<string, number> = {};

        // Helper para encontrar índice de uma coluna que contenha X
        const findCol = (searchTerms: string[]) => {
            return headerRow.findIndex(h => searchTerms.some(term => h.includes(term)));
        };

        colMap['CLIENTE'] = findCol(['CLIENTE', 'NOME']);
        colMap['MORADA'] = findCol(['MORADA', 'ENTREGA', 'ENDERECO']);
        colMap['LOCALIDADE'] = findCol(['LOCALIDADE']);
        colMap['CONCELHO'] = findCol(['CONCELHO']);
        colMap['DISTRITO'] = findCol(['DISTRITO']);
        colMap['EXECUCAO'] = findCol(['EXECUCAO', 'LOCALINSTALACAO']);
        
        colMap['TIPO_EQUIP'] = findCol(['TIPOEQUIPAMENTO', 'PRODUTO', 'MODELO']);
        colMap['CAPACIDADE'] = findCol(['CAPACIDADE', 'ALCANCE']);
        colMap['NS_EQUIP'] = findCol(['SERIEEQUIPAMENTO', 'NUMEROSERIE', 'NSERIE']);
        colMap['CELULAS'] = findCol(['CELULA', 'SENSOR']);
        colMap['VISOR'] = findCol(['VISOR', 'INDICADOR']);
        colMap['NS_VISOR'] = findCol(['SERIEVISOR']);
        colMap['DESCRICAO'] = findCol(['DESCRICAO', 'OBSERVACOES']);
        colMap['TIPO_SERVICO'] = findCol(['TIPOSERVICO']);

        colMap['DATA_INICIO'] = findCol(['DATAINICIO']);
        colMap['DATA_FIM'] = findCol(['DATAFIM']);
        colMap['ESTADO'] = findCol(['ESTADO', 'SITUACAO']);
        colMap['VISITA_LIGEIRO'] = findCol(['VISITALIGEIRO', 'LIGEIROS']);
        colMap['VISITA_PESADO'] = findCol(['VISITAPESADO', 'CAMIAO', 'PESADOS']);

        if (colMap['CLIENTE'] === -1) {
             setError(`Coluna 'CLIENTE' não encontrada na linha ${headerRowIndex + 1}.`);
             return;
        }

        // 3. Extrair Dados
        const dataRows = rawData.slice(headerRowIndex + 1);
        const clientsMap = new Map<string, Client>();
        let equipCount = 0;

        // Helper seguro para obter valor da célula
        const getVal = (row: any[], key: string): string => {
            const idx = colMap[key];
            if (idx === -1 || !row[idx]) return '';
            return String(row[idx]).trim();
        };

        dataRows.forEach((row, index) => {
            const clientName = getVal(row, 'CLIENTE');
            if (!clientName) return;

            // Location
            const morada = getVal(row, 'MORADA');
            const localidade = getVal(row, 'LOCALIDADE');
            const concelho = getVal(row, 'CONCELHO');
            const distrito = getVal(row, 'DISTRITO');
            const execucao = getVal(row, 'EXECUCAO');

            // Specs
            const tipoEquip = getVal(row, 'TIPO_EQUIP') || 'Equipamento Geral';
            const capacidade = getVal(row, 'CAPACIDADE');
            const nsEquip = getVal(row, 'NS_EQUIP') || 'S/N';
            const celulas = getVal(row, 'CELULAS');
            const visor = getVal(row, 'VISOR');
            const nsVisor = getVal(row, 'NS_VISOR');
            
            // Description logic
            const tipoServico = getVal(row, 'TIPO_SERVICO');
            const descRaw = getVal(row, 'DESCRICAO');
            const fullDesc = [tipoServico, descRaw].filter(Boolean).join(' - ');

            // Contract
            const dtInicio = parseDate(getVal(row, 'DATA_INICIO'));
            const dtFim = parseDate(getVal(row, 'DATA_FIM'));
            const estado = getVal(row, 'ESTADO').toLowerCase();
            const isPaid = estado.includes('pago') || estado.includes('liquidado');
            
            // Try to parse numbers, handle "1 un" or similar text
            const cleanNum = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
            const vLigeiro = cleanNum(getVal(row, 'VISITA_LIGEIRO'));
            const vPesado = cleanNum(getVal(row, 'VISITA_PESADO'));

            // Client Mgmt
            let client = clientsMap.get(clientName);
            if (!client) {
                client = {
                    id: `imp-c-${index}`,
                    name: clientName,
                    address: morada || 'Morada desconhecida',
                    locality: localidade,
                    district: distrito,
                    contactPerson: 'Gestão de Contratos',
                    email: '',
                    phone: '',
                    equipments: []
                };
                clientsMap.set(clientName, client);
            }

            // Equipment Mgmt
            const equipment: Equipment = {
                id: `imp-e-${index}-${equipCount++}`,
                clientId: client.id,
                
                deliveryAddress: morada,
                locality: localidade,
                municipality: concelho,
                district: distrito,
                executionSite: execucao,
                description: fullDesc,
                
                // Display Location Priority
                location: execucao || morada || localidade || 'Local não definido',
                
                productName: tipoEquip,
                weightCapacity: capacidade,
                loadCells: celulas,
                equipmentSerial: nsEquip,
                viewerModel: visor,
                viewerSerial: nsVisor,
                
                installDate: dtInicio || new Date().toISOString().split('T')[0],
                type: mapEquipmentType(tipoEquip),
                visits: [],
                contract: {
                    id: `imp-ctr-${index}`,
                    equipmentId: '', // set after
                    startDate: dtInicio || new Date().toISOString().split('T')[0],
                    endDate: dtFim || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    invoiceNumber: '',
                    isPaid: isPaid,
                    totalLightVisits: vLigeiro,
                    usedLightVisits: 0,
                    totalTruckVisits: vPesado,
                    usedTruckVisits: 0,
                    renewed: false
                }
            };
            if(equipment.contract) equipment.contract.equipmentId = equipment.id;
            
            client.equipments.push(equipment);
        });

        const clientsArray = Array.from(clientsMap.values());
        
        if (clientsArray.length === 0) {
            setError("Nenhum dado válido encontrado. O cabeçalho foi detetado, mas as linhas parecem vazias ou sem nome de cliente.");
        } else {
            setParsedData(clientsArray);
            setStats({
                clients: clientsArray.length,
                equipments: clientsArray.reduce((acc, c) => acc + c.equipments.length, 0)
            });
        }

      } catch (err) {
          console.error("Erro critico:", err);
          setError("Erro inesperado ao processar os dados.");
      }
  };

  const handleParse = () => {
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'csv') {
        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            encoding: "ISO-8859-1", // Tentar codificação comum para Excel PT
            complete: (results) => processData(results.data as any[][]),
            error: (err) => setError(`Erro CSV: ${err.message}`)
        });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
                processData(jsonData as any[][]);
            } catch (err) {
                setError("Erro ao ler ficheiro Excel.");
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        setError("Formato não suportado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Dados
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
                            id="importInput"
                        />
                        <label htmlFor="importInput" className="cursor-pointer flex flex-col items-center">
                            <Upload className="w-10 h-10 text-emerald-500 mb-2" />
                            <span className="text-sm font-medium text-slate-700">Clique para selecionar ficheiro</span>
                            <span className="text-xs text-slate-400 mt-1">Excel (.xlsx) ou CSV</span>
                        </label>
                    </div>
                    
                    {file && (
                        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 p-2 rounded border border-slate-200">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            <span className="truncate">{file.name}</span>
                        </div>
                    )}
                    
                    {error && (
                        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-100">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>{error}</div>
                        </div>
                    )}

                    <button
                        onClick={handleParse}
                        disabled={!file}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-md shadow-emerald-200 transition-all"
                    >
                        Processar Ficheiro
                    </button>
                </>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-center">
                        <div className="mx-auto w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                            <Check className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-emerald-900 text-lg mb-1">Sucesso!</h4>
                        <p className="text-sm text-emerald-700 mb-4">Dados prontos para importação</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-2 rounded border border-emerald-100">
                                <span className="block text-xl font-bold text-emerald-600">{stats.clients}</span>
                                <span className="text-xs text-slate-500">Clientes</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-emerald-100">
                                <span className="block text-xl font-bold text-emerald-600">{stats.equipments}</span>
                                <span className="text-xs text-slate-500">Equipamentos</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setStats(null); setFile(null); }}
                            className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => parsedData && onImport(parsedData)}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm"
                        >
                            Importar Dados
                        </button>
                    </div>
                </div>
            )}
            
            <div className="mt-2 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                    <HelpCircle className="w-3 h-3 mt-0.5" />
                    <p>O importador deteta automaticamente as colunas como <b>CLIENTE</b>, <b>MORADA</b>, <b>EQUIPAMENTO</b>, <b>DATA INICIO</b>, etc., mesmo que não estejam na primeira linha.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;