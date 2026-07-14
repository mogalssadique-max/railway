import React, { useState } from 'react';
import { Parcel, ParcelStatus, Station, INDIAN_STATIONS } from '../data';
import { 
  IndianRupee, TrendingUp, ShieldCheck, CheckCircle2, Circle, 
  MapPin, Edit3, Save, Search, Settings, ArrowRight, RefreshCw, BarChart2 
} from 'lucide-react';

interface AdminPanelProps {
  parcels: Parcel[];
  onUpdateParcel: (updatedParcel: Parcel) => void;
  stations: Station[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  parcels,
  onUpdateParcel,
  stations,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Status Editor states
  const [newStatus, setNewStatus] = useState<ParcelStatus>('Booked');
  const [newLocation, setNewLocation] = useState('');
  const [newTimestamp, setNewTimestamp] = useState('');

  // Search filter
  const filteredParcels = parcels.filter((p) => 
    p.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pickupStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.destinationStation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Total system metrics
  const totalParcels = parcels.length;
  const totalRevenue = parcels.reduce((acc, curr) => acc + curr.cost, 0);
  const activeCount = parcels.filter(p => p.status !== 'Delivered').length;
  const deliveredCount = parcels.filter(p => p.status === 'Delivered').length;

  const handleEditClick = (p: Parcel) => {
    setSelectedParcel(p);
    setNewStatus(p.status);
    setNewLocation(p.currentLocation);
    
    // Set timestamp to current local time
    const today = new Date();
    setNewTimestamp(`${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, ${today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;

    const statuses: ParcelStatus[] = ['Booked', 'Dispatched', 'In Transit', 'Out For Delivery', 'Delivered'];
    const newIdx = statuses.indexOf(newStatus);

    // Build the updated history log
    const updatedHistory = selectedParcel.history.map((step, idx) => {
      if (idx < newIdx) {
        // Earlier steps must be marked completed
        return {
          ...step,
          completed: true,
          timestamp: step.timestamp === 'Pending' || step.timestamp.includes('Pending') ? newTimestamp : step.timestamp
        };
      } else if (idx === newIdx) {
        // Target active step
        return {
          ...step,
          status: newStatus,
          location: newLocation,
          timestamp: newTimestamp,
          completed: true,
        };
      } else {
        // Future steps remain pending
        return {
          ...step,
          completed: false,
          timestamp: 'Pending'
        };
      }
    });

    const updatedParcel: Parcel = {
      ...selectedParcel,
      status: newStatus,
      currentLocation: newLocation,
      history: updatedHistory,
      estimatedDelivery: newStatus === 'Delivered' ? newTimestamp.split(',')[0] : selectedParcel.estimatedDelivery
    };

    onUpdateParcel(updatedParcel);
    setSelectedParcel(updatedParcel); // refresh editor state
    
    // Trigger small visual success flash on form
    const alertBox = document.getElementById('admin-success-toast');
    if (alertBox) {
      alertBox.classList.remove('opacity-0');
      alertBox.classList.add('opacity-100');
      setTimeout(() => {
        alertBox.classList.remove('opacity-100');
        alertBox.classList.add('opacity-0');
      }, 2500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Header with Title & Refresh */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" />
            Central Dispatcher Control Room
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal cargo tracking management, pricing analytics, and shipment status triggers.
          </p>
        </div>
      </div>

      {/* System-wide Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                Total Bookings
              </span>
              <h4 className="text-xl font-bold font-mono mt-1 text-slate-800 dark:text-slate-100">
                {totalParcels}
              </h4>
            </div>
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% Growth
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                Total Freight Revenue
              </span>
              <h4 className="text-xl font-bold font-mono mt-1 text-blue-600 dark:text-blue-400 flex items-center">
                <IndianRupee className="w-4 h-4 shrink-0" /> {totalRevenue}
              </h4>
            </div>
            <span className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Average ticket: ₹{Math.round(totalRevenue / (totalParcels || 1))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                Active in Transit
              </span>
              <h4 className="text-xl font-bold font-mono mt-1 text-slate-800 dark:text-slate-100">
                {activeCount}
              </h4>
            </div>
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
            </span>
          </div>
          <div className="text-[10px] text-amber-500 font-bold mt-2">
            ● SLA Action required
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                Delivered Cargo
              </span>
              <h4 className="text-xl font-bold font-mono mt-1 text-slate-800 dark:text-slate-100">
                {deliveredCount}
              </h4>
            </div>
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[10px] text-emerald-500 font-bold mt-2">
            ✓ 99.4% On-time Rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Searchable Datatable of All Cargo: 7 Columns */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Parcel Inventory Registry ({filteredParcels.length})
            </h4>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Search ID, sender, route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-3.5">Tracking ID</th>
                  <th className="p-3.5">Sender</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredParcels.map((parcel) => (
                  <tr 
                    key={parcel.trackingId} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${
                      selectedParcel?.trackingId === parcel.trackingId ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {parcel.trackingId}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold">{parcel.senderName}</div>
                      <div className="text-[10px] text-slate-400">{parcel.senderPhone}</div>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>{parcel.pickupStation}</div>
                      <div className="text-slate-400">→ {parcel.destinationStation}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                        parcel.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : parcel.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {parcel.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleEditClick(parcel)}
                        className="p-1 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 rounded transition-all text-slate-500"
                        title="Update Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredParcels.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500">
                      No matching parcels registered in dispatcher database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Transition Dispatcher Console: 5 Columns */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm">
              Live Dispatcher Status Console
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Select any parcel from inventory registry to update its logistics milestone logs.
            </p>
          </div>

          {selectedParcel ? (
            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div id="admin-success-toast" className="opacity-0 transition-opacity duration-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Logistics logs updated successfully. Real-time tracking updated.</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  <span>Selected Tracking Reference</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">{selectedParcel.trackingId}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Route From</span>
                    <span>{selectedParcel.pickupStation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Destination To</span>
                    <span>{selectedParcel.destinationStation}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Logistics Phase Transition</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ParcelStatus)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                >
                  <option value="Booked">Booked (Registered at origin depot)</option>
                  <option value="Dispatched">Dispatched (Loading on cargo express trains)</option>
                  <option value="In Transit">In Transit (Rolling stock rolling on regional tracks)</option>
                  <option value="Out For Delivery">Out For Delivery (Arrived at local city junction)</option>
                  <option value="Delivered">Delivered (Handed over to consignee)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Current Hub/Location Name</label>
                <input 
                  type="text" 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Kota Junction Parcel Terminal"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Transit Timestamp Log Note</label>
                <input 
                  type="text" 
                  value={newTimestamp}
                  onChange={(e) => setNewTimestamp(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Dispatcher Records
              </button>
            </form>
          ) : (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Settings className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-spin-slow" />
              <span>Select any cargo row in the Inventory registry to load control room parameters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
