import React, { useState } from 'react';
import { MenuItem, SelectedModifier } from '../types';
import { X, Plus, Check } from 'lucide-react';

interface ModifierModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, selectedModifiers: SelectedModifier[], notes: string) => void;
}

const ModifierModal: React.FC<ModifierModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
  const [selectedMods, setSelectedMods] = useState<SelectedModifier[]>([]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleToggleOption = (groupName: string, optionName: string, priceDelta: number, maxSelect: number) => {
    setSelectedMods(prev => {
      const existingInGroup = prev.filter(m => m.groupName === groupName);
      const isAlreadySelected = prev.some(m => m.groupName === groupName && m.optionName === optionName);

      if (isAlreadySelected) {
        return prev.filter(m => !(m.groupName === groupName && m.optionName === optionName));
      }

      if (maxSelect === 1) {
        const withoutGroup = prev.filter(m => m.groupName !== groupName);
        return [...withoutGroup, { groupName, optionName, priceDelta }];
      }

      if (existingInGroup.length >= maxSelect) {
        return prev;
      }

      return [...prev, { groupName, optionName, priceDelta }];
    });
  };

  const calculatedExtraPrice = selectedMods.reduce((acc, m) => acc + m.priceDelta, 0);
  const finalUnitPrice = item.price + calculatedExtraPrice;

  const handleSave = () => {
    onConfirm(item, selectedMods, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">{item.category}</span>
            <h3 className="text-xl font-bold text-white">{item.name}</h3>
            <p className="text-sm font-semibold text-emerald-300 mt-1">Base Price: ${item.price.toFixed(2)}</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {item.modifierGroups && item.modifierGroups.length > 0 ? (
            item.modifierGroups.map(group => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {group.name}
                  </h4>
                  <span className="text-xs font-medium text-slate-400">
                    {group.maxSelect === 1 ? 'Select 1' : `Up to ${group.maxSelect}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map(option => {
                    const isSelected = selectedMods.some(
                      m => m.groupName === group.name && m.optionName === option.name
                    );

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleToggleOption(group.name, option.name, option.priceDelta, group.maxSelect)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm">{option.name}</span>
                        </div>
                        {option.priceDelta > 0 && (
                          <span className="text-xs font-semibold text-slate-500">
                            +${option.priceDelta.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No specific modifier choices for this item.</p>
          )}

          {/* Kitchen Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kitchen Instructions / Allergy Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Extra crispy, no onions, gluten allergy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Item Total</span>
            <p className="text-2xl font-black text-slate-900">${finalUnitPrice.toFixed(2)}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifierModal;
