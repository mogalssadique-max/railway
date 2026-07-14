import React, { useState } from 'react';
import { Parcel, ParcelStatus } from '../data';
import { 
  Search, ShieldCheck, CheckCircle2, Circle, Clock, MapPin, 
  AlertCircle, HelpCircle, Package, ArrowRight, Truck 
} from 'lucide-react';

interface TrackingSectionProps {
  onSearch: (id: string) => Parcel | null;
  activeParcel: Parcel | null;
  setActiveParcel: (parcel: Parcel | null) => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  onSearch,
  activeParcel,
  setActiveParcel,
}) => {
  const [searchId, setSearchId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!searchId.trim()) {
      return setErrorMsg('Please enter a Tracking ID');
    }

    const found = onSearch(searchId.trim());
    if (!found) {
      setErrorMsg(`No active cargo found matching Tracking ID: "${searchId.trim()}"`);
      setActiveParcel(null);
    }
  };

  const handleQuickSelect = (id: string) => {
    setSearchId(id);
    setErrorMsg('');
    const found = onSearch(id);
    if (found) {
      setActiveParcel(found);
    }
  };

  // Helper to determine step icon and layout
  const getStepStatus = (stepIndex: number, currentStatus: ParcelStatus) => {
    const statuses: ParcelStatus[] = ['Booked', 'Dispatched', 'In Transit', 'Out For Delivery', 'Delivered'];
    const currentIdx = statuses.indexOf(currentStatus);

    if (stepIndex < currentIdx) return 'completed';
    if (stepIndex === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Search Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Track Your Cargo Shipment
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Enter your 13-character tracking reference to check live route logs and ETA schedules.
        </p>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Package className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="Enter Tracking Number (e.g. RPX2026001234)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 font-mono transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              Track Parcel <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/20 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Click Demo ID recommendations */}
          <div className="pt-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
              Demo Tracking IDs (Click to test instantly)
            </p>
            <div className="flex flex-wrap gap-2">
              {['RPX2026001234', 'RPX2026005678', 'RPX2026009999'].map((demoId) => (
                <button
                  key={demoId}
                  type="button"
                  onClick={() => handleQuickSelect(demoId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-mono font-medium transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                >
                  {demoId}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Tracking Results Card */}
      {activeParcel && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs transition-colors animate-fade-in">
          
          {/* Tracking Summary Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-mono font-bold text-slate-800 dark:text-slate-100">
                  {activeParcel.trackingId}
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                  activeParcel.status === 'Delivered' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                    : activeParcel.status === 'In Transit'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse'
                }`}>
                  {activeParcel.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Route Schedule: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeParcel.pickupStation}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{activeParcel.destinationStation}</span>
              </p>
            </div>
            
            <div className="sm:text-right bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs shrink-0 w-full sm:w-auto">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                Estimated Delivery
              </span>
              <span className="text-slate-800 dark:text-slate-100 font-bold mt-0.5 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                {activeParcel.estimatedDelivery}
              </span>
            </div>
          </div>

          {/* Interactive Progress Timeline */}
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Logistics Journey Milestones
            </h5>

            <div className="relative">
              {/* Vertical dotted bar connector */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-800 z-0"></div>

              <div className="space-y-6 relative z-10">
                {activeParcel.history.map((step, idx) => {
                  const stepState = getStepStatus(idx, activeParcel.status);
                  
                  let iconBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                  let statusTitleStyle = 'text-slate-400 dark:text-slate-500';
                  let iconElement = <Circle className="w-3.5 h-3.5" />;

                  if (stepState === 'completed') {
                    iconBg = 'bg-blue-600 text-white';
                    statusTitleStyle = 'font-bold text-slate-800 dark:text-slate-200';
                    iconElement = <CheckCircle2 className="w-4 h-4" />;
                  } else if (stepState === 'active') {
                    iconBg = 'bg-amber-500 text-white animate-bounce';
                    statusTitleStyle = 'font-bold text-amber-600 dark:text-amber-400';
                    iconElement = <Truck className="w-4 h-4" />;
                  }

                  return (
                    <div key={idx} className="flex gap-4 items-start">
                      {/* Badge / Node */}
                      <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xs ${iconBg}`}>
                        {iconElement}
                      </div>

                      {/* Info block */}
                      <div className="space-y-0.5 bg-slate-50/40 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-xs ${statusTitleStyle}`}>{step.status}</span>
                          <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">{step.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" /> {step.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cargo Parcel Specs Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Cargo Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 uppercase">{activeParcel.parcelType}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Weight load</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{activeParcel.weight} kg</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Logistics Speed</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{activeParcel.speed} Express</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Transit Shield</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {activeParcel.insurance ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                    Covered
                  </>
                ) : (
                  'Not Covered'
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
