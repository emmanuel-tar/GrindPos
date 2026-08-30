import React, { useState } from 'react';
import { Table, TableStatus, Reservation } from '../types';
import { 
  Users, 
  Clock, 
  Sparkles, 
  Calendar, 
  Plus, 
  Check, 
  ShoppingBag, 
  UtensilsCrossed, 
  Brush, 
  Coffee, 
  AlertCircle 
} from 'lucide-react';

interface FloorPlanViewProps {
  tables: Table[];
  reservations: Reservation[];
  onUpdateTableStatus: (tableId: number, newStatus: TableStatus, extra?: Partial<Table>) => void;
  onSelectTableForPOS: (table: Table) => void;
  onAddReservation: (res: Reservation) => void;
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({
  tables,
  reservations,
  onUpdateTableStatus,
  onSelectTableForPOS,
  onAddReservation,
}) => {
  const [selectedSection, setSelectedSection] = useState<'All' | 'Dining' | 'Patio' | 'Bar Lounge'>('All');
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [showResModal, setShowResModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newPax, setNewPax] = useState(2);
  const [newTime, setNewTime] = useState('08:00 PM');
  const [newNotes, setNewNotes] = useState('');

  const sections = ['All', 'Dining', 'Patio', 'Bar Lounge'] as const;

  const filteredTables = tables.filter(t => selectedSection === 'All' || t.section === selectedSection);

  const statusColors: Record<TableStatus, { bg: string; text: string; border: string; badge: string; label: string }> = {
    vacant: { bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', label: 'Vacant' },
    seated: { bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', label: 'Seated' },
    ordered: { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', label: 'Ordered / Dining' },
    check_dropped: { bg: 'bg-purple-50/50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', label: 'Check Dropped' },
    cleaning: { bg: 'bg-orange-50/50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', label: 'Cleaning Needed' },
    reserved: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', badge: 'bg-slate-200 text-slate-800', label: 'Reserved' },
  };

  const handleSeatReservation = (res: Reservation) => {
    // find a matching vacant table
    const vacantTable = tables.find(t => t.status === 'vacant' && t.capacity >= res.guests);
    if (vacantTable) {
      onUpdateTableStatus(vacantTable.id, 'seated', {
        currentGuestCount: res.guests,
        serverName: 'Sam Taylor',
        seatedSince: 'Just now',
        notes: `Reservation: ${res.customerName}`
      });
      alert(`Seated party of ${res.guests} at Table #${vacantTable.number}`);
    } else {
      alert('No vacant table with sufficient capacity available right now.');
    }
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    const res: Reservation = {
      id: `res-${Date.now()}`,
      customerName: newCustName,
      phone: newCustPhone,
      guests: newPax,
      date: 'Today',
      time: newTime,
      status: 'confirmed',
      notes: newNotes,
    };
    onAddReservation(res);
    setShowResModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewNotes('');
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* Floor Plan & Tables Grid */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Top Filter and Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex gap-2">
            {sections.map(sec => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSection === sec
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Quick Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vacant</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Seated</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Dining</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Check Dropped</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Cleaning</span>
          </div>
        </div>

        {/* Floor Map Layout */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
          {filteredTables.map(table => {
            const sc = statusColors[table.status] || statusColors.vacant;
            const isSelected = activeTable?.id === table.id;

            return (
              <div
                key={table.id}
                onClick={() => setActiveTable(table)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${sc.bg} ${
                  isSelected ? 'border-orange-500 ring-4 ring-orange-500/10 shadow-lg scale-[1.02]' : sc.border
                } hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{table.section}</span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">Table {table.number}</h3>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${sc.badge}`}>
                    {sc.label}
                  </span>
                </div>

                {/* Table metadata info */}
                <div className="my-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: <strong>{table.capacity} Pax</strong> {table.currentGuestCount ? `(${table.currentGuestCount} seated)` : ''}</span>
                  </div>
                  {table.serverName && (
                    <div className="text-xs text-slate-500 font-medium">
                      Server: <strong className="text-slate-800">{table.serverName}</strong>
                    </div>
                  )}
                  {table.seatedSince && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: {table.seatedSince}</span>
                    </div>
                  )}
                  {table.notes && (
                    <p className="text-[11px] text-orange-700 bg-orange-100/60 px-2 py-1 rounded-lg italic">
                      {table.notes}
                    </p>
                  )}
                </div>

                {/* Quick actions on card */}
                <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                  {table.status === 'vacant' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTableStatus(table.id, 'seated', { currentGuestCount: table.capacity, serverName: 'Sam Taylor', seatedSince: 'Just now' });
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Seat Walk-in
                    </button>
                  )}

                  {(table.status === 'seated' || table.status === 'ordered') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTableForPOS(table);
                      }}
                      className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Order POS
                    </button>
                  )}

                  {table.status === 'check_dropped' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTableStatus(table.id, 'cleaning');
                      }}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}

                  {table.status === 'cleaning' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTableStatus(table.id, 'vacant', { currentGuestCount: undefined, serverName: undefined, seatedSince: undefined, notes: undefined });
                      }}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Brush className="w-3.5 h-3.5" /> Sanitized & Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Drawer: Table Inspector & Reservations */}
      <div className="w-96 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Active Table Details */}
        {activeTable ? (
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Selected Table</span>
                <h3 className="text-xl font-black text-slate-900">Table #{activeTable.number} ({activeTable.section})</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[activeTable.status]?.badge}`}>
                {activeTable.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateTableStatus(activeTable.id, 'vacant')}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-emerald-50 font-bold text-slate-700"
              >
                Set Vacant
              </button>
              <button
                onClick={() => onUpdateTableStatus(activeTable.id, 'seated', { serverName: 'Sam Taylor', seatedSince: 'Just now' })}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-blue-50 font-bold text-slate-700"
              >
                Set Seated
              </button>
              <button
                onClick={() => onUpdateTableStatus(activeTable.id, 'check_dropped')}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-purple-50 font-bold text-slate-700"
              >
                Drop Check
              </button>
              <button
                onClick={() => onUpdateTableStatus(activeTable.id, 'cleaning')}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-orange-50 font-bold text-slate-700"
              >
                Needs Cleaning
              </button>
            </div>

            <button
              onClick={() => onSelectTableForPOS(activeTable)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Open Table in POS Terminal
            </button>
          </div>
        ) : (
          <div className="p-6 border-b border-slate-100 text-center text-slate-400 text-xs">
            Click on any table card to view details or override status.
          </div>
        )}

        {/* Reservations Section */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-bold text-slate-900">Reservations</h3>
            </div>
            <button
              onClick={() => setShowResModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Booking
            </button>
          </div>

          {/* Reservations List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {reservations.map(res => (
              <div key={res.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{res.customerName}</h4>
                    <p className="text-xs text-slate-500">{res.phone}</p>
                  </div>
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                    {res.time}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Party: <strong>{res.guests} Guests</strong></span>
                  {res.tableNumber ? (
                    <span className="text-emerald-700 font-bold">Assigned Table {res.tableNumber}</span>
                  ) : (
                    <span className="text-slate-400">Unassigned</span>
                  )}
                </div>

                {res.notes && (
                  <p className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                    {res.notes}
                  </p>
                )}

                <button
                  onClick={() => handleSeatReservation(res)}
                  className="w-full py-1.5 mt-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Seat This Party
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showResModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">New Table Reservation</h3>
            <form onSubmit={handleCreateReservation} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Phone</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Guests (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    value={newPax}
                    onChange={(e) => setNewPax(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Time Slot</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Special Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="High chair, window seat, anniversary..."
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlanView;
