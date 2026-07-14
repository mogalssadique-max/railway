/**
 * Railway Parcel Express - Application Types and Initial Seeding Data
 */

export interface Station {
  id: string;
  name: string;
  code: string;
  state: string;
  x: number; // map percentage coordinates
  y: number;
}

export type ParcelStatus = 'Booked' | 'Dispatched' | 'In Transit' | 'Out For Delivery' | 'Delivered';

export interface TrackingStep {
  status: ParcelStatus;
  location: string;
  timestamp: string;
  completed: boolean;
}

export interface Parcel {
  trackingId: string;
  senderName: string;
  senderPhone: string;
  pickupStation: string;
  destinationStation: string;
  parcelType: string;
  weight: number;
  speed: 'Standard' | 'Express' | 'SuperFast';
  insurance: boolean;
  pickupDate: string;
  paymentMethod: string;
  status: ParcelStatus;
  currentLocation: string;
  estimatedDelivery: string;
  cost: number;
  bookingDate: string;
  history: TrackingStep[];
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Post {
  id: string;
  category: 'Delivery Updates' | 'Customer Stories' | 'Safety Tips' | 'Offers & Discounts';
  title: string;
  summary: string;
  date: string;
  likes: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Tracking' | 'Booking' | 'Pricing' | 'Support' | 'Insurance';
}

// Master Indian Railway Stations with coordinates for the custom vector map
export const INDIAN_STATIONS: Station[] = [
  { id: 'ndls', name: 'New Delhi', code: 'NDLS', state: 'Delhi', x: 42, y: 22 },
  { id: 'bct', name: 'Mumbai Central', code: 'MMCT', state: 'Maharashtra', x: 20, y: 62 },
  { id: 'mas', name: 'Chennai Central', code: 'MAS', state: 'Tamil Nadu', x: 50, y: 88 },
  { id: 'hwh', name: 'Howrah Junction', code: 'HWH', state: 'West Bengal', x: 78, y: 45 },
  { id: 'sbc', name: 'Bengaluru City', code: 'SBC', state: 'Karnataka', x: 40, y: 85 },
  { id: 'sec', name: 'Secunderabad (Hyderabad)', code: 'SC', state: 'Telangana', x: 45, y: 65 },
  { id: 'bza', name: 'Vijayawada Junction', code: 'BZA', state: 'Andhra Pradesh', x: 52, y: 68 },
  { id: 'pnbe', name: 'Patna Junction', code: 'PNBE', state: 'Bihar', x: 68, y: 32 },
  { id: 'adi', name: 'Ahmedabad Junction', code: 'ADI', state: 'Gujarat', x: 18, y: 48 },
  { id: 'pune', name: 'Pune Junction', code: 'PUNE', state: 'Maharashtra', x: 25, y: 68 },
];

export const PARCEL_TYPES = [
  { label: 'General Goods (Cartons/Boxes)', value: 'general', multiplier: 1.0 },
  { label: 'Perishable Items (Cold Chain)', value: 'perishable', multiplier: 1.5 },
  { label: 'Fragile Electronics/Glassware', value: 'fragile', multiplier: 1.8 },
  { label: 'Automobile Parts/Heavy Industrial', value: 'industrial', multiplier: 2.0 },
  { label: 'Documents & High Priority Letters', value: 'documents', multiplier: 0.8 },
];

// Seeded active parcels for testing tracking instantly
export const INITIAL_PARCELS: Parcel[] = [
  {
    trackingId: 'RPX2026001234',
    senderName: 'Rajesh Kumar',
    senderPhone: '+91 98765 43210',
    pickupStation: 'Vijayawada Junction',
    destinationStation: 'Secunderabad (Hyderabad)',
    parcelType: 'general',
    weight: 15,
    speed: 'Express',
    insurance: true,
    pickupDate: '2026-07-11',
    paymentMethod: 'UPI',
    status: 'In Transit',
    currentLocation: 'Vijayawada Junction',
    estimatedDelivery: '15 July 2026',
    cost: 425,
    bookingDate: '2026-07-11',
    history: [
      { status: 'Booked', location: 'Vijayawada Junction', timestamp: '11 July 2026, 10:30 AM', completed: true },
      { status: 'Dispatched', location: 'Vijayawada Junction Parcel Depot', timestamp: '11 July 2026, 04:15 PM', completed: true },
      { status: 'In Transit', location: 'Vijayawada Junction Outbound Yard', timestamp: '12 July 2026, 09:00 AM', completed: true },
      { status: 'Out For Delivery', location: 'Secunderabad Junction', timestamp: 'Awaiting arrival', completed: false },
      { status: 'Delivered', location: 'Destination Address', timestamp: 'Pending', completed: false },
    ]
  },
  {
    trackingId: 'RPX2026005678',
    senderName: 'Sita Sharma',
    senderPhone: '+91 91234 56789',
    pickupStation: 'New Delhi',
    destinationStation: 'Mumbai Central',
    parcelType: 'fragile',
    weight: 8,
    speed: 'SuperFast',
    insurance: true,
    pickupDate: '2026-07-12',
    paymentMethod: 'Credit Card',
    status: 'Dispatched',
    currentLocation: 'New Delhi Parcel Terminal',
    estimatedDelivery: '14 July 2026',
    cost: 850,
    bookingDate: '2026-07-12',
    history: [
      { status: 'Booked', location: 'New Delhi Railway Station', timestamp: '12 July 2026, 08:00 AM', completed: true },
      { status: 'Dispatched', location: 'New Delhi Parcel Terminal', timestamp: '12 July 2026, 02:30 PM', completed: true },
      { status: 'In Transit', location: 'Enroute (Kota Junction)', timestamp: 'Awaiting transit', completed: false },
      { status: 'Out For Delivery', location: 'Mumbai Central Depot', timestamp: 'Awaiting transit', completed: false },
      { status: 'Delivered', location: 'Mumbai Central Destination', timestamp: 'Pending', completed: false },
    ]
  },
  {
    trackingId: 'RPX2026009999',
    senderName: 'Anil Gupta',
    senderPhone: '+91 99887 76655',
    pickupStation: 'Howrah Junction',
    destinationStation: 'Patna Junction',
    parcelType: 'perishable',
    weight: 25,
    speed: 'Standard',
    insurance: false,
    pickupDate: '2026-07-09',
    paymentMethod: 'Net Banking',
    status: 'Delivered',
    currentLocation: 'Patna Junction',
    estimatedDelivery: '11 July 2026',
    cost: 650,
    bookingDate: '2026-07-09',
    history: [
      { status: 'Booked', location: 'Howrah Junction Parcel House', timestamp: '09 July 2026, 11:00 AM', completed: true },
      { status: 'Dispatched', location: 'Howrah Junction Outbound', timestamp: '09 July 2026, 06:00 PM', completed: true },
      { status: 'In Transit', location: 'Asansol Junction Yard', timestamp: '10 July 2026, 04:00 AM', completed: true },
      { status: 'Out For Delivery', location: 'Patna Junction Local Sorting Office', timestamp: '11 July 2026, 09:15 AM', completed: true },
      { status: 'Delivered', location: 'Patna Door Delivery', timestamp: '11 July 2026, 02:45 PM', completed: true },
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'Excellent service. My heavy industrial parts arrived safely and ahead of schedule. Highly recommended!',
    date: '10 July 2026',
    verified: true
  },
  {
    id: 'rev-2',
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Very easy online booking process, and the price estimation was exactly what I paid. Accurate tracking details too.',
    date: '08 July 2026',
    verified: true
  },
  {
    id: 'rev-3',
    name: 'Mohan Reddy',
    rating: 5,
    comment: 'Professional support team at Secunderabad station. Helped me clear the documentation quickly. Superb transit speed!',
    date: '05 July 2026',
    verified: true
  },
  {
    id: 'rev-4',
    name: 'Anjali Verma',
    rating: 4,
    comment: 'I sent mango baskets from Vijayawada to Delhi. Arrived in fresh condition via express booking. Tracking is very clear.',
    date: '03 July 2026',
    verified: true
  }
];

export const LATEST_POSTS: Post[] = [
  {
    id: 'post-1',
    category: 'Delivery Updates',
    title: 'Monsoon Cargo Advisory & Route Updates',
    summary: 'Railway Parcel Express is maintaining 98% on-time delivery despite high rainfall. Minor route diversions in western ghats are active with no significant delays.',
    date: '12 July 2026',
    likes: 124
  },
  {
    id: 'post-2',
    category: 'Offers & Discounts',
    title: 'Flat 15% Off on Bulk Industrial Shipments',
    summary: 'Book automated freight or heavy machinery components above 100 kilograms and get flat 15% off. Discount automatically applied at booking counters and online checkout.',
    date: '10 July 2026',
    likes: 89
  },
  {
    id: 'post-3',
    category: 'Customer Stories',
    title: 'Empowering Small Organic Framers in South India',
    summary: 'Read how our specialized Express Cold Chain parcel vans helped local organic farmers deliver fresh produce across 6 tier-1 cities within 24 hours.',
    date: '07 July 2026',
    likes: 232
  },
  {
    id: 'post-4',
    category: 'Safety Tips',
    title: 'Guidelines for Packing Perishable Parcels',
    summary: 'Ensure secure packaging for fresh fruits or biological samples. Use high-grade leakproof thermocol containers with dry ice blocks for maximum longevity.',
    date: '04 July 2026',
    likes: 54
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I track my parcel?',
    answer: 'Simply enter your 13-character Tracking ID (e.g., RPX2026001234) in the search bar on our Track Parcel page or home screen to see its live transit status and history.',
    category: 'Tracking'
  },
  {
    id: 'faq-2',
    question: 'Can I book a parcel online for door pickup?',
    answer: 'Yes! We support station-to-station as well as premium door-pickup and door-delivery services. Select the "Door Pickup" option during booking and specify your schedule.',
    category: 'Booking'
  },
  {
    id: 'faq-3',
    question: 'Which payment options are accepted?',
    answer: 'We support all popular secure payment options including UPI, Credit Cards, Debit Cards, and Net Banking with instant receipt generation.',
    category: 'Pricing'
  },
  {
    id: 'faq-4',
    question: 'What items are prohibited from being sent via Railway Parcel Express?',
    answer: 'Explosives, flammable liquids, compressed gases, corrosive materials, illegal contraband, and dangerous wild animals are strictly prohibited according to central transit safety laws.',
    category: 'Support'
  },
  {
    id: 'faq-5',
    question: 'How is the estimated cargo cost calculated?',
    answer: 'Pricing is dynamically computed based on the distance between source and destination stations, the parcel weight, selected delivery speed, and chosen cargo insurance.',
    category: 'Pricing'
  },
  {
    id: 'faq-6',
    question: 'Is insurance mandatory for all shipments?',
    answer: 'Insurance is optional but highly recommended. It covers 100% of declared value against accidents, fire, or unpredictable natural transit hazards for a nominal fee (0.5% of value).',
    category: 'Insurance'
  }
];
