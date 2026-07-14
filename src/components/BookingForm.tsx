import React, { useState, useEffect } from 'react';
import { INDIAN_STATIONS, PARCEL_TYPES, Parcel, Station } from '../data';
import { 
  IndianRupee, ShieldCheck, CheckCircle2, Box, Sparkles, 
  ArrowRight, Download, QrCode, AlertCircle, RefreshCw 
} from 'lucide-react';

interface BookingFormProps {
  onBookingSuccess: (newParcel: Parcel) => void;
  initialPickupStation?: string;
  initialDestinationStation?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onBookingSuccess,
  initialPickupStation = '',
  initialDestinationStation = '',
}) => {
  // Form States
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pickup, setPickup] = useState(initialPickupStation);
  const [destination, setDestination] = useState(initialDestinationStation);
  const [weight, setWeight] = useState<number>(5);
  const [parcelType, setParcelType] = useState('general');
  const [speed, setSpeed] = useState<'Standard' | 'Express' | 'SuperFast'>('Express');
  const [insurance, setInsurance] = useState(false);
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // defaults to tomorrow
    return today.toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<Parcel | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync props if changed
  useEffect(() => {
    if (initialPickupStation) setPickup(initialPickupStation);
    if (initialDestinationStation) setDestination(initialDestinationStation);
  }, [initialPickupStation, initialDestinationStation]);

  // Pricing math
  const calculatePricing = () => {
    if (!pickup || !destination) return { base: 0, weightCost: 0, speedPremium: 0, insurancePremium: 0, gst: 0, total: 0 };
    
    // Simple mock calculation based on station coordinate distances
    const st1 = INDIAN_STATIONS.find(s => s.name === pickup || s.code === pickup);
    const st2 = INDIAN_STATIONS.find(s => s.name === destination || s.code === destination);
    
    let distanceFactor = 100;
    if (st1 && st2) {
      const dx = st1.x - st2.x;
      const dy = st1.y - st2.y;
      distanceFactor = Math.max(100, Math.round(Math.sqrt(dx * dx + dy * dy) * 12));
    }

    const typeObj = PARCEL_TYPES.find(p => p.value === parcelType);
    const typeMultiplier = typeObj ? typeObj.multiplier : 1.0;

    const base = 120 * typeMultiplier;
    const weightCost = weight * 12 * (distanceFactor / 200);
    
    let speedPremium = 0;
    if (speed === 'Express') speedPremium = (base + weightCost) * 0.25;
    else if (speed === 'SuperFast') speedPremium = (base + weightCost) * 0.50;

    const insurancePremium = insurance ? Math.max(50, (base + weightCost + speedPremium) * 0.05) : 0;
    const subtotal = base + weightCost + speedPremium + insurancePremium;
    const gst = subtotal * 0.18;
    const total = Math.round(subtotal + gst);

    return {
      base: Math.round(base),
      weightCost: Math.round(weightCost),
      speedPremium: Math.round(speedPremium),
      insurancePremium: Math.round(insurancePremium),
      gst: Math.round(gst),
      total
    };
  };

  const pricing = calculatePricing();

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!senderName.trim()) return setErrorMsg('Please enter Sender Name');
    if (!senderPhone.trim()) return setErrorMsg('Please enter Sender Mobile Number');
    if (!pickup) return setErrorMsg('Please select a pickup station');
    if (!destination) return setErrorMsg('Please select a destination station');
    if (pickup === destination) return setErrorMsg('Pickup and destination stations cannot be the same');
    if (weight <= 0) return setErrorMsg('Parcel weight must be greater than 0');

    setLoading(true);

    // Simulate network latency for payment processing
    setTimeout(() => {
      const generatedId = `RPX${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
      const bookedParcel: Parcel = {
        trackingId: generatedId,
        senderName,
        senderPhone,
        pickupStation: pickup,
        destinationStation: destination,
        parcelType,
        weight,
        speed,
        insurance,
        pickupDate,
        paymentMethod,
        status: 'Booked',
        currentLocation: pickup,
        estimatedDelivery: new Date(Date.now() + (speed === 'SuperFast' ? 2 : speed === 'Express' ? 3 : 5) * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        cost: pricing.total,
        bookingDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        history: [
          { status: 'Booked', location: pickup, timestamp: `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`, completed: true },
          { status: 'Dispatched', location: `${pickup} Depot`, timestamp: 'Pending dispatch', completed: false },
          { status: 'In Transit', location: 'Route Transit Hub', timestamp: 'Pending transit', completed: false },
          { status: 'Out For Delivery', location: `${destination} Terminal`, timestamp: 'Pending transit', completed: false },
          { status: 'Delivered', location: 'Destination Address', timestamp: 'Pending delivery', completed: false },
        ]
      };

      setLoading(false);
      setBookingResult(bookedParcel);
      onBookingSuccess(bookedParcel);
    }, 1800);
  };

  const handleDownloadInvoice = () => {
    if (!bookingResult) return;
    
    // Create print-friendly content or image download
    const printContent = document.getElementById('printable-booking-invoice');
    if (printContent) {
      const win = window.open('', '', 'width=800,height=900');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Railway Parcel Express - Invoice Receipt</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { padding: 30px; font-family: sans-serif; }
                .border-dashed-custom { border-style: dashed; }
              </style>
            </head>
            <body>
              <div class="max-w-2xl mx-auto border border-gray-300 p-8 rounded-lg bg-white">
                <div class="flex justify-between items-center border-b pb-6">
                  <div>
                    <h2 class="text-2xl font-bold text-blue-900">RAILWAY PARCEL EXPRESS</h2>
                    <p class="text-xs text-gray-500">Government Authorized Logistics & Transit Service</p>
                  </div>
                  <div class="text-right">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-bold">PAID</span>
                    <p class="text-xs text-gray-400 mt-2">Receipt ID: ${bookingResult.trackingId}</p>
                  </div>
                </div>
                ${printContent.innerHTML}
                <div class="text-center text-xs text-gray-400 mt-12 border-t pt-4">
                  This is a computer-generated receipt valid for transit clearance. Thank you for choosing Indian Railways logistics.
                </div>
              </div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
      {!bookingResult ? (
        <form onSubmit={handleBook} className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Box className="w-5 h-5 text-orange-500" />
                Book Your Cargo Parcel Online
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accurate pricing, quick processing, and safe station shipping.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" /> Live Estimates
            </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/30 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Fields: 7 Columns */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Contact Details Grid */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  1. Contact Coordinates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sender Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Rajesh Kumar"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sender Mobile (+91)</label>
                    <input 
                      type="tel" 
                      placeholder="e.g., 98765 43210"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Receiver Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Priya Sharma"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Receiver Mobile</label>
                    <input 
                      type="tel" 
                      placeholder="e.g., 91234 56789"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Stations selection */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  2. Route Journey
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pickup Station Hub</label>
                    <select
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Pickup Station</option>
                      {INDIAN_STATIONS.map(st => (
                        <option key={st.id} value={st.name}>{st.name} ({st.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Destination Station Hub</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Destination</option>
                      {INDIAN_STATIONS.map(st => (
                        <option key={st.id} value={st.name}>{st.name} ({st.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parcel Details */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  3. Cargo Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Parcel Type</label>
                    <select
                      value={parcelType}
                      onChange={(e) => setParcelType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100"
                    >
                      {PARCEL_TYPES.map(pt => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Weight (kg)</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        min="1"
                        max="500"
                        value={weight || ''}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pickup Date</label>
                    <input 
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Delivery Speed Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Delivery Velocity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Standard', 'Express', 'SuperFast'] as const).map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setSpeed(spd)}
                          className={`py-2 px-1 text-center text-xs font-medium rounded-lg transition-all border ${
                            speed === spd 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Insurance option */}
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-5">
                    <input 
                      type="checkbox" 
                      id="insurance-checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="insurance-checkbox" className="text-xs cursor-pointer select-none">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Secure-Shield Cargo Insurance
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Covers 100% value for fire & hazard (₹50 base premium)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Summary Panel: 5 Columns */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Live Cargo Cost Estimates
                </h4>

                {pickup && destination ? (
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                      <span>Base Parcel Freight Rate</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100 flex items-center">
                        <IndianRupee className="w-3 h-3" /> {pricing.base}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                      <span>Weight Freight Surcharge ({weight}kg)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100 flex items-center">
                        <IndianRupee className="w-3 h-3" /> {pricing.weightCost}
                      </span>
                    </div>

                    {speed !== 'Standard' && (
                      <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                        <span>{speed} Speed Premium</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 flex items-center">
                          + <IndianRupee className="w-3 h-3" /> {pricing.speedPremium}
                        </span>
                      </div>
                    )}

                    {insurance && (
                      <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                        <span>Secure-Shield Premium</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center">
                          + <IndianRupee className="w-3 h-3" /> {pricing.insurancePremium}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <span>Logistics GST (18%)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100 flex items-center">
                        <IndianRupee className="w-3 h-3" /> {pricing.gst}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t-2 border-dashed border-slate-200 dark:border-slate-800 pt-4 pb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Estimated Grand Total</span>
                      <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 flex items-center">
                        <IndianRupee className="w-4 h-4" /> {pricing.total}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center">
                      Rates based on distance between {pickup} and {destination}
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Please select both Pickup & Destination stations to calculate live transit quotes.
                  </div>
                )}

                {/* Secure checkout option */}
                <div className="space-y-3.5 border-t border-slate-200 dark:border-slate-800 pt-5">
                  <h5 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wide">
                    4. Select Secure Payment Channel
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: 'UPI', label: 'UPI' },
                      { id: 'Card', label: 'Debit/Credit' },
                      { id: 'NetBanking', label: 'Net Bank' }
                    ] as const).map((pay) => (
                      <button
                        key={pay.id}
                        type="button"
                        onClick={() => setPaymentMethod(pay.id)}
                        className={`py-2 px-1 text-center text-xs font-semibold rounded-lg transition-all border ${
                          paymentMethod === pay.id 
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {pay.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !pickup || !destination}
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Authorizing Digital Payment...
                      </>
                    ) : (
                      <>
                        Book Parcel Now <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Success Screen / Invoice View */
        <div className="p-6 md:p-8 space-y-6 text-slate-800 dark:text-slate-100 animate-fade-in">
          <div className="text-center space-y-2 max-w-md mx-auto py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Booking Confirmed Successfully!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Payment was cleared via {bookingResult.paymentMethod}. Your parcel is scheduled for pickup at {bookingResult.pickupStation}.
            </p>
          </div>

          {/* Printable Invoice Board */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
            <div id="printable-booking-invoice" className="p-5 sm:p-6 space-y-6 bg-white dark:bg-slate-900">
              
              {/* Header inside receipt */}
              <div className="flex flex-col sm:flex-row justify-between border-b pb-4 border-slate-200 dark:border-slate-800 gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Railway Booking Reference
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                      {bookingResult.trackingId}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] rounded font-semibold font-mono">
                      PAID
                    </span>
                  </div>
                </div>
                <div className="sm:text-right text-xs">
                  <p className="text-slate-500 dark:text-slate-400">Booking Date: <span className="font-medium text-slate-700 dark:text-slate-300">{bookingResult.bookingDate}</span></p>
                  <p className="text-slate-500 dark:text-slate-400">Scheduled Journey: <span className="font-medium text-slate-700 dark:text-slate-300">{bookingResult.pickupDate}</span></p>
                </div>
              </div>

              {/* Transit Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                    Route Schedule
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Origin: </span> 
                      {bookingResult.pickupStation}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Destination: </span> 
                      {bookingResult.destinationStation}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Transit Speed: </span> 
                      {bookingResult.speed} Cargo Speed
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                    Cargo Details & Logistics
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Type: </span> 
                      {bookingResult.parcelType.toUpperCase()} Goods
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Weight: </span> 
                      {bookingResult.weight} kg
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Cargo Shield: </span> 
                      {bookingResult.insurance ? 'Yes (100% covered)' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    Sender Info
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{bookingResult.senderName}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">{bookingResult.senderPhone}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    Receiver Info
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{bookingResult.receiverName || 'To Be Picked At Station'}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">{bookingResult.receiverPhone || 'N/A'}</p>
                </div>
              </div>

              {/* Barcode & QR Code Section */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-6">
                
                {/* Barcode representation */}
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Railway Barcode Clearance
                  </p>
                  <div className="inline-block bg-slate-100 p-2.5 rounded-lg border">
                    <svg className="h-10 w-48 sm:w-56" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <rect x="0" width="100" height="20" fill="#f8fafc" />
                      <g fill="#000000">
                        <rect x="1" y="2" width="1.5" height="16" />
                        <rect x="4" y="2" width="0.75" height="16" />
                        <rect x="6" y="2" width="2" height="16" />
                        <rect x="9" y="2" width="0.5" height="16" />
                        <rect x="11" y="2" width="1" height="16" />
                        <rect x="14" y="2" width="2.5" height="16" />
                        <rect x="18" y="2" width="0.5" height="16" />
                        <rect x="20" y="2" width="1.5" height="16" />
                        <rect x="23" y="2" width="2" height="16" />
                        <rect x="27" y="2" width="0.75" height="16" />
                        <rect x="30" y="2" width="1" height="16" />
                        <rect x="33" y="2" width="3" height="16" />
                        <rect x="38" y="2" width="0.5" height="16" />
                        <rect x="40" y="2" width="2" height="16" />
                        <rect x="44" y="2" width="1" height="16" />
                        <rect x="47" y="2" width="1.5" height="16" />
                        <rect x="50" y="2" width="2.5" height="16" />
                        <rect x="54" y="2" width="0.5" height="16" />
                        <rect x="56" y="2" width="1.5" height="16" />
                        <rect x="59" y="2" width="2" height="16" />
                        <rect x="63" y="2" width="0.75" height="16" />
                        <rect x="66" y="2" width="1" height="16" />
                        <rect x="69" y="2" width="3" height="16" />
                        <rect x="74" y="2" width="0.5" height="16" />
                        <rect x="76" y="2" width="2" height="16" />
                        <rect x="80" y="2" width="1" height="16" />
                        <rect x="83" y="2" width="1.5" height="16" />
                        <rect x="86" y="2" width="2.5" height="16" />
                        <rect x="90" y="2" width="0.5" height="16" />
                        <rect x="92" y="2" width="1.5" height="16" />
                        <rect x="95" y="2" width="2" height="16" />
                        <rect x="98" y="2" width="1" height="16" />
                      </g>
                    </svg>
                    <p className="text-center font-mono text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
                      {bookingResult.trackingId}
                    </p>
                  </div>
                </div>

                {/* QR Code representation */}
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
                    Quick Mobile Receipt
                  </p>
                  <div className="w-20 h-20 p-1.5 bg-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-center relative">
                    {/* SVG Styled Custom QR Code Grid */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Top Left Finder Pattern */}
                      <rect x="5" y="5" width="25" height="25" fill="#000000" />
                      <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                      <rect x="13" y="13" width="9" height="9" fill="#000000" />
                      
                      {/* Top Right Finder Pattern */}
                      <rect x="70" y="5" width="25" height="25" fill="#000000" />
                      <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                      <rect x="78" y="13" width="9" height="9" fill="#000000" />

                      {/* Bottom Left Finder Pattern */}
                      <rect x="5" y="70" width="25" height="25" fill="#000000" />
                      <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                      <rect x="13" y="78" width="9" height="9" fill="#000000" />

                      {/* Some randomized blocks to simulate a real QR Code */}
                      <rect x="35" y="5" width="8" height="8" fill="#000000" />
                      <rect x="47" y="12" width="12" height="6" fill="#000000" />
                      <rect x="35" y="20" width="15" height="5" fill="#000000" />
                      <rect x="60" y="25" width="8" height="15" fill="#000000" />
                      <rect x="35" y="40" width="10" height="10" fill="#000000" />
                      <rect x="50" y="45" width="20" height="8" fill="#000000" />
                      <rect x="75" y="40" width="12" height="12" fill="#000000" />
                      <rect x="15" y="35" width="8" height="20" fill="#000000" />
                      <rect x="35" y="60" width="15" height="12" fill="#000000" />
                      <rect x="55" y="60" width="8" height="30" fill="#000000" />
                      <rect x="70" y="65" width="18" height="10" fill="#000000" />
                      <rect x="75" y="80" width="15" height="15" fill="#000000" />
                      <rect x="35" y="80" width="15" height="15" fill="#000000" />
                      
                      {/* Logo container in QR */}
                      <rect x="40" y="40" width="20" height="20" rx="3" fill="#ffffff" />
                      <circle cx="50" cy="50" r="8" fill="#f59e0b" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price Paid Row */}
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-5 text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Logistics Tariff Paid</span>
                <span className="font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center font-mono">
                  <IndianRupee className="w-4 h-4" /> {bookingResult.cost}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadInvoice}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Booking Invoice
            </button>
            <button
              onClick={() => setBookingResult(null)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              Book Another Parcel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
