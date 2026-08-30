import React, { useState } from 'react';
import { StaffMember } from '../types';
import { X, Lock, Delete, UserCheck, ShieldAlert } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onSelectStaff: (staff: StaffMember) => void;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, staffList, onSelectStaff }) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMessage('');

      if (next.length === 4 && selectedStaff) {
        if (next === selectedStaff.pin) {
          onSelectStaff(selectedStaff);
          onClose();
          setPinInput('');
          setSelectedStaff(null);
        } else {
          setErrorMessage('Invalid PIN. Please try again.');
          setPinInput('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleSelectUserCard = (member: StaffMember) => {
    setSelectedStaff(member);
    setPinInput('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Fast Terminal Switch</h3>
              <p className="text-xs text-slate-400">Select profile and enter 4-digit PIN</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Staff Avatars Bar */}
          <div className="grid grid-cols-5 gap-2">
            {staffList.map(member => {
              const isSelected = selectedStaff?.id === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => handleSelectUserCard(member)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50/80 scale-105 shadow-md' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${member.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 truncate max-w-full">{member.name.split(' ')[0]}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">{member.role}</span>
                </button>
              );
            })}
          </div>

          {selectedStaff ? (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Entering PIN for {selectedStaff.name} ({selectedStaff.role})
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Default Demo PIN: <strong className="text-slate-700">{selectedStaff.pin}</strong></span>
              </div>

              {/* PIN Dots */}
              <div className="flex justify-center gap-3 my-2">
                {[0, 1, 2, 3].map(index => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pinInput.length > index
                        ? 'bg-orange-500 border-orange-500 scale-110'
                        : 'border-slate-300 bg-slate-100'
                    }`}
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-bold animate-shake">
                  <ShieldAlert className="w-4 h-4" /> {errorMessage}
                </div>
              )}

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map(key => {
                  if (key === 'C') {
                    return (
                      <button
                        key={key}
                        onClick={() => setPinInput('')}
                        className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
                      >
                        CLR
                      </button>
                    );
                  }
                  if (key === 'DEL') {
                    return (
                      <button
                        key={key}
                        onClick={handleBackspace}
                        className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => handleDigit(key)}
                      className="h-14 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 text-slate-900 font-black text-xl active:scale-95 transition-all shadow-xs"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Please choose a staff member above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinModal;
