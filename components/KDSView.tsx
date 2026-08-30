import React, { useState, useEffect } from 'react';
import { Order, KitchenStation, OrderStatus } from '../types';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Utensils, 
  Volume2, 
  VolumeX, 
  CheckSquare, 
  Square,
  ArrowRight,
  Sparkles,
  Gauge,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KDSViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleItemCompletion?: (orderId: string, itemId: string) => void;
}

const KDSView: React.FC<KDSViewProps> = ({ orders, onUpdateOrderStatus }) => {
  const [selectedStation, setSelectedStation] = useState<KitchenStation>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [viewFilter, setViewFilter] = useState<'active' | 'completed'>('active');
  const [showMetricsStrip, setShowMetricsStrip] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [completedItemIds, setCompletedItemIds] = useState<{ [key: string]: boolean }>({});

  // Live timer tick every second for real-time kitchen elapsed timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log('Audio chime not supported');
    }
  };

  const toggleItemCheck = (itemId: string) => {
    setCompletedItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter orders
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');
  const finishedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');

  const displayedOrders = (viewFilter === 'active' ? activeOrders : finishedOrders).filter(order => {
    if (selectedStation === 'all') return true;
    return order.items.some(item => (item.station || 'grill') === selectedStation);
  });

  const getElapsedMinutes = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    return Math.floor((currentTime - created) / 60000);
  };

  const getElapsedSeconds = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    return Math.floor(((currentTime - created) % 60000) / 1000);
  };

  const handleBumpStatus = (order: Order) => {
    playChime();
    if (order.status === 'pending') {
      onUpdateOrderStatus(order.id, 'preparing');
    } else if (order.status === 'preparing') {
      onUpdateOrderStatus(order.id, 'ready');
    } else if (order.status === 'ready') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onUpdateOrderStatus(order.id, 'completed');
    }
  };

  const stations: { id: KitchenStation; label: string; avgTime: string; load: string; color: string }[] = [
    { id: 'all', label: 'All Stations', avgTime: '6.4m', load: 'Normal', color: 'text-slate-200' },
    { id: 'grill', label: 'Grill & Range', avgTime: '8.8m', load: 'High (85%)', color: 'text-orange-400' },
    { id: 'fryer', label: 'Fry Station', avgTime: '4.5m', load: 'Optimal', color: 'text-emerald-400' },
    { id: 'salad', label: 'Pantry / Salad', avgTime: '3.2m', load: 'Light', color: 'text-blue-400' },
    { id: 'bar', label: 'Beverage & Bar', avgTime: '2.4m', load: 'Optimal', color: 'text-amber-400' },
    { id: 'dessert', label: 'Pastry / Dessert', avgTime: '5.1m', load: 'Light', color: 'text-purple-400' },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Station & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {stations.map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStation === st.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Metrics Strip */}
          <button
            onClick={() => setShowMetricsStrip(!showMetricsStrip)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showMetricsStrip ? 'border-orange-500/50 bg-orange-500/20 text-orange-300' : 'border-slate-700 text-slate-400'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Metrics {showMetricsStrip ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound alert switch */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Chimes {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Active / Completed Filter */}
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewFilter === 'active' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setViewFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewFilter === 'completed' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              History ({finishedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Kitchen Performance & Bottleneck Analysis Strip */}
      {showMetricsStrip && (
        <div className="bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between gap-4 shadow-sm text-xs">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-slate-300">Station Velocities:</span>
            </div>
            {stations.filter(s => s.id !== 'all').map(st => (
              <div key={st.id} className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">{st.label.split(' ')[0]}:</span>
                <span className={`font-mono font-bold ${st.color}`}>{st.avgTime}</span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{st.load}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
            <span>🔥 Cook-Line Efficiency Index: <strong>96.4% On-Time</strong></span>
          </div>
        </div>
      )}


      {/* KDS Active Tickets Grid */}
      {displayedOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ChefHat className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">All Clear in the Kitchen!</h3>
            <p className="text-sm text-slate-400 max-w-sm mt-1">
              No active tickets currently queued for {selectedStation === 'all' ? 'any station' : selectedStation}. New orders placed in the POS will appear instantly.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-6">
          {displayedOrders.map(order => {
            const elapsedMin = getElapsedMinutes(order.createdAt);
            const elapsedSec = getElapsedSeconds(order.createdAt);
            const isCritical = elapsedMin >= 18;
            const isWarning = elapsedMin >= 10 && elapsedMin < 18;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 shadow-sm flex flex-col overflow-hidden transition-all duration-200 ${
                  isCritical 
                    ? 'border-red-500 ring-2 ring-red-500/20 shadow-red-500/10' 
                    : isWarning 
                    ? 'border-amber-400' 
                    : order.status === 'ready' 
                    ? 'border-emerald-500 bg-emerald-50/20' 
                    : 'border-slate-200'
                }`}
              >
                {/* Ticket Header */}
                <div className={`p-4 flex items-center justify-between text-white ${
                  isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-600' : order.status === 'ready' ? 'bg-emerald-600' : 'bg-slate-900'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black tracking-tight">
                        {order.orderType === 'dine_in' ? `T-${order.tableNumber || 1}` : order.orderType.toUpperCase()}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-md">
                        #{order.orderNumber || order.id.slice(-4)}
                      </span>
                    </div>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {order.serverName ? `Server: ${order.serverName}` : `${order.items.length} items`}
                    </span>
                  </div>

                  {/* Live Timer */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-mono text-base font-black">
                      <Clock className="w-4 h-4" />
                      <span>{String(elapsedMin).padStart(2, '0')}:{String(elapsedSec).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      {order.status === 'ready' ? 'Ready' : order.status === 'preparing' ? 'Cooking' : 'Queued'}
                    </span>
                  </div>
                </div>

                {/* Ticket Items Body */}
                <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-72 divide-y divide-slate-100">
                  {order.items.map(item => {
                    const isChecked = !!completedItemIds[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemCheck(item.id)}
                        className={`pt-2.5 first:pt-0 cursor-pointer group flex items-start gap-2.5 select-none ${
                          isChecked ? 'opacity-40 line-through' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-slate-400 group-hover:text-orange-500 transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-sm">
                              {item.quantity}x {item.name}
                            </span>
                            {item.station && (
                              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.station}
                              </span>
                            )}
                          </div>

                          {/* Modifiers */}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.modifiers.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mr-1 mb-0.5"
                                >
                                  • {m.optionName}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Kitchen Notes */}
                          {item.notes && (
                            <div className="mt-1 p-1.5 bg-orange-50 border border-orange-200 rounded-lg text-[11px] font-bold text-orange-800">
                              ⚠️ {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Action Bump Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleBumpStatus(order)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4" /> Start Prep
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleBumpStatus(order)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Order Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleBumpStatus(order)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" /> Bump / Served
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <div className="py-2 text-center text-xs font-bold text-emerald-600">
                      ✓ Order Completed & Served
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KDSView;
