import React, { useState } from 'react';
import { X, CreditCard, Calendar } from 'lucide-react';
import { Contract } from '../types';

interface PaymentModalProps {
  contract: Contract;
  onClose: () => void;
  onSave: (paymentData: { date: string, invoice: string }) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ contract, onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoice, setInvoice] = useState(contract.invoiceNumber || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ date, invoice });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-green-50 rounded-t-xl">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Registar Pagamento
          </h3>
          <button onClick={onClose} className="hover:bg-green-100 text-green-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data do Pagamento</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Número da Fatura</label>
            <input
              type="text"
              required
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Ex: FT 2024/000"
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md shadow-green-200"
            >
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;