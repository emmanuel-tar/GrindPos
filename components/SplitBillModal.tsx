import React, { useState } from 'react';
import { OrderItem } from '../types';
import { X, Users, CreditCard, Banknote, CheckCircle2, Split } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  onCompleteSplit: (payments: { guest: string; amount: number; method: 'cash' | 'card' }[]) => void;
}

const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  total,
  onCompleteSplit,
}) => {
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [numGuests, setNumGuests] = useState<number>(2);
  const [paidGuests, setPaidGuests] = useState<{ [key: number]: boolean }>({});
  const [guestMethods, setGuestMethods] = useState<{ [key: number]: 'cash' | 'card' }>({
    1: 'card',
    2: 'cash',
    3: 'card',
    4: 'card',
  });

  if (!isOpen) return null;

  const perGuestAmount = total / Math.max(1, numGuests);
  const allPaid = Array.from({ length: numGuests }).every((_, idx) => paidGuests[idx + 1]);

  const handlePayGuest = (guestNum: number) => {
    setPaidGuests(prev => ({
      ...prev,
      [guestNum]: !prev[guestNum]
    }));
  };

  const handleFinalize = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    const payments = Array.from({ length: numGuests }).map((_, idx) => ({
      guest: `Guest ${idx + 1}`,
      amount: perGuestAmount,
      method: guestMethods[idx + 1] || 'card'
    }));
    onCompleteSplit(payments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl text-white">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Split Check</h3>
              <p className="text-xs text-slate-400">Total Check Amount: <span className="text-white font-bold">${total.toFixed(2)}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-6 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setSplitMode('equal')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                splitMode === 'equal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Equal Split (By Headcount)
            </button>
          </div>

          {/* Number of Guests Slider */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Split Between</span>
              <span className="text-base font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                {numGuests} Guests
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  onClick={() => {
                    setNumGuests(count);
                    setPaidGuests({});
                  }}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                    numGuests === count
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>
          </div>

          {/* Guests Payment List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {Array.from({ length: numGuests }).map((_, idx) => {
              const guestNum = idx + 1;
              const isPaid = !!paidGuests[guestNum];
              const method = guestMethods[guestNum] || 'card';

              return (
                <div
                  key={guestNum}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isPaid
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      isPaid ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      #{guestNum}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Guest {guestNum}</h4>
                      <p className="text-base font-black text-slate-900">${perGuestAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Method switch */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setGuestMethods(prev => ({ ...prev, [guestNum]: 'card' }))}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          method === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuestMethods(prev => ({ ...prev, [guestNum]: 'cash' }))}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          method === 'cash' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handlePayGuest(guestNum)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        isPaid
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                        </>
                      ) : (
                        'Collect'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Payment Progress</span>
            <p className="text-sm font-bold text-slate-800">
              {Object.values(paidGuests).filter(Boolean).length} / {numGuests} Guests Settled
            </p>
          </div>

          <button
            disabled={!allPaid}
            onClick={handleFinalize}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Close Split Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;
