import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, HelpCircle, Loader2 } from 'lucide-react';
import { Order, InventoryItem, MenuItem, StaffMember, WasteLog, Location } from '../types';
import { askErpCopilot } from '../geminiService';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  staff: StaffMember[];
  wasteLogs: WasteLog[];
  currentLocation: Location;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  inventory,
  menuItems,
  staff,
  wasteLogs,
  currentLocation,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello Alex! I am your RestoFlow AI Operations Copilot for ${currentLocation.name}. How can I assist you with menu profitability, inventory reorders, labor tracking, or rush forecasting today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const answer = await askErpCopilot(textToSend, {
      orders,
      inventory,
      menuItems,
      staff,
      wasteLogs,
      branchName: currentLocation.name,
    });

    const botMsg: Message = {
      sender: 'assistant',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const samplePrompts = [
    "What items should we reorder right now?",
    "How is our labor cost tracking against sales?",
    "Which menu items have the highest profit margins?",
    "Forecast prep quantities for Friday dinner rush",
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">RestoFlow AI Copilot</h3>
            <span className="text-xs text-orange-400 font-medium">Gemini 3.7 Flash Intelligence</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-orange-600 text-white font-medium rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            <span>Analyzing restaurant data...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-white border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
          Suggested Operations Queries
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-600 font-medium transition-all text-left truncate max-w-full"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AI anything about operations, food cost, staff..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AiAssistantDrawer;
