

export type Subscription = {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  pricePaid: number;
}


export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'traveler' | 'organizer' | 'admin';
  referralCode?: string;
  walletBalance?: number;
  organizerApplication?: OrganizerApplication;
  organizerStatus?: Organizer['status'];
  organizerId?: string; // Added to link user to their organizer profile
  joinDate?: string; // For tracking new users
  status?: 'active' | 'suspended'; // For user management
  partnerType?: 'trip' | 'experience';

  // New fields for user preferences
  preferredCities?: string[];
  travelInterests?: string[];
  additionalNotes?: string;

  // New detailed profile fields
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  homeCity?: string;
  dietaryPreferences?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
  };
  governmentId?: {
    type: 'Aadhaar' | 'Passport' | 'Driving License';
    number: string;
  };

  // Travonex Pro fields
  subscriptionTier?: 'free' | 'pro';
  aiCredits?: number;
  subscriptionHistory?: Subscription[];
};

export type Trip = {
  id: string;
  slug: string;
  title: string;
  category: string; // Changed to string to allow for custom values
  location: string;
  departureCity: string;
  duration: string;
  price: number;
  isPriceTaxInclusive: boolean;
  rating: number | string;
  reviewsCount: number;
  description: string;
  shortDescription: string;
  image: string; // Main cover image
  gallery?: string[]; // Array of image IDs for the carousel
  organizer: Organizer;
  itinerary: ItineraryItem[];
  inclusions: string[];
  exclusions: string[];
  status?: 'published' | 'pending' | 'draft';
  adminRemarks?: string; // For rejection feedback
  isSuggested?: boolean; // For home page suggestions

  // New detailed fields
  difficulty?: string; // Changed to string to allow for custom values
  minAge?: number;
  maxAge?: number;
  highlights?: string[];
  batches?: Batch[];
  pickupPoints?: LogisticsPoint[];
  dropoffPoints?: LogisticsPoint[];
  cancellationPolicy?: string;
  faqs?: TripFAQ[];
  reviews?: Review[];
  reviewTags?: { tag: string; count: number }[];
  remarks?: string; // New field for other details
  spotReservationEnabled?: boolean;
  spotReservationPercentage?: number;
  balanceDueDays?: number;
  videoUrl?: string; // New field for the video URL
};

export type Batch = {
  id: string;
  startDate: string;
  endDate: string;
  availableSlots: number;
  status: 'Active' | 'Inactive' | 'Full';
  priceOverride?: number;
  isLastMinuteDeal?: boolean;
  dealPrice?: number;
};

export type LogisticsPoint = {
  location: string;
  time: string;
  address?: string;
  mapLink: string;
};

// Renamed from FAQ to avoid conflict with platform-wide FAQ type
export type TripFAQ = {
  question: string;
  answer: string;
};

// New type for platform-wide FAQs
export type FAQ = {
  id?: string;
  question: string;
  answer: string;
};


export type Organizer = {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  status?: 'approved' | 'pending' | 'rejected' | 'agreement_sent' | 'agreement_review';
  application?: OrganizerApplication;
  leadCredits?: number;
  bio?: string;
  adminRemarks?: string; // For agreement rejection
  commissionRate?: number; // Custom commission rate for this organizer
  partnerType?: 'trip' | 'experience';
  websiteUrl?: string;
  instagramUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  joinedDate?: string;
  updatedAt?: any; // Firestore Timestamp
};

export type OrganizerApplication = {
  partnerType: 'trip' | 'experience';
  organizerType: 'individual' | 'business';
  companyName: string;
  experience: string;
  website?: string;

  // Contact Details
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Documents
  panCard?: string;
  idProof?: string;
  businessPan?: string;
  gstCertificate?: string;
  businessRegistration?: string;
  bankStatement: string;

  // New Experience Vendor Docs
  activityLicenses?: string;
  equipmentCertificates?: string;
  insuranceDocs?: string;
  staffCerts?: string;

  // Bank Details
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
};


export type Booking = {
  id: string;
  tripId: string;
  batchId: string; // Added to know which batch was booked
  tripTitle: string;
  travelerName: string;
  travelerPhone: string;
  travelerId?: string; // Added to link to a user
  bookingDate: string;
  totalPrice: number;
  organizerId: string;
  numberOfTravelers: number;

  // Fields for partial payment
  paymentType: 'Full' | 'Partial';
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'Paid in Full' | 'Reserved' | 'Pending Balance' | 'Cancelled';
  paymentGatewayId?: string; // e.g., Razorpay Payment ID like 'pay_O4yBq5Jm8aL3fG'

  // New fields for refund flow
  refundStatus?: 'none' | 'requested' | 'approved_by_organizer' | 'rejected_by_organizer' | 'processed' | 'rejected_by_admin';
  refundRequestDate?: string;
  refundRejectionReason?: string;
  refundProcessedDate?: string;
  approvedRefundAmount?: number;
  cancellationInitiator?: 'traveler' | 'organizer' | 'admin';
  cancellationReason?: string;
  refundUtr?: string; // Can now store the gateway's refund ID

  proDiscount?: number; // New field for applied Pro discount

  coTravelers?: {
    name: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
  }[];
};

export type ItineraryItem = {
  day: number;
  title: string;
  description: string;
};

export type Review = {
  id: string;
  tripId?: string; // Can be for a trip or experience
  experienceId?: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};

export type BlogStory = {
  id: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  scope: 'global' | 'organizer'; // global (admin) or organizer-specific
  organizerId?: string; // only if scope is 'organizer'
  usageLimit?: number;
  timesUsed?: number;
  expiresAt?: string;
  isActive?: boolean;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number; // positive for credit, negative for debit
  type: 'credit' | 'debit';
};

export type Referral = {
  id: string;
  referrerName: string;
  referrerId: string;
  referredUserName: string;
  referredUserId: string;
  date: string;
  bonusAmount: number;
  status: 'Credited';
};

export type Lead = {
  id: string;
  tripId: string;
  tripTitle: string;
  organizerId: string;
  travelerId: string;
  travelerName: string;
  travelerPhone: string;
  message: string;
  date: string;
  status: 'new' | 'unlocked' | 'converted' | 'archived';
};

export type LeadPackage = {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  originalPrice: number;
  popular: boolean;
};

// This type represents a completed batch that is ready for financial processing.
// It is a "view model" used by the payouts and settlements pages.
export type ProcessedBatch = {
  id: string;
  tripTitle: string;
  batchEndDate: string;
  grossRevenue: number;
  commission: number;
  netEarning: number;
  status: 'Available for Payout' | 'Processing' | 'Paid';
  invoiceUrl?: string;
  utrNumber?: string;
  successfulBookingsCount: number;
  cancelledBookingsCount: number;
  successfulRevenue: number;
  cancellationRevenue: number;
  organizerId?: string;
  organizerName?: string;
};


// New type for Admin Audit Logs
export type AuditLog = {
  id: string;
  timestamp: string;
  adminName: string;
  action: 'Trip Approved' | 'Trip Rejected' | 'Organizer Approved' | 'Organizer Rejected' | 'Organizer Agreement Sent' | 'Organizer Agreement Rejected' | 'Organizer Agreement Submitted' | 'Refund Requested' | 'Refund Approved by Organizer' | 'Refund Rejected by Organizer' | 'Refund Processed by Admin';
  entityType: 'Trip' | 'Organizer' | 'Booking';
  entityId: string;
  entityName: string;
  details?: string;
};

// --- NEW TYPES FOR EXPERIENCES VERTICAL ---

export type ExperienceVendor = {
  id: string;
  name: string;
  isVerified: boolean;
  avatar: string; // image ID
};

export type Experience = {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: string;
  price: number;
  isPriceTaxInclusive: boolean;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  highlights: string[];
  description: string;
  inclusions: string[];
  exclusions: string[];
  safetyNotes: string;
  cancellationPolicy: string;
  images: string[]; // array of image IDs
  vendor: ExperienceVendor;
  availability: {
    type: 'daily' | 'weekdays' | 'weekends';
    timeSlots: string[]; // e.g., ["09:00", "11:00", "14:00"]
  };
  pickupPoints?: LogisticsPoint[];
  dropoffPoints?: LogisticsPoint[];
  reviews?: Review[];
  remarks?: string;
  videoUrl?: string;
};

export type ExperienceBooking = {
  id: string;
  experienceId: string;
  experienceTitle: string;
  travelerId: string;
  travelerName: string;
  travelerPhone: string;
  bookingDate: string; // The date the booking was made
  activityDate: string; // The date of the activity
  timeSlot: string;
  participants: number;
  totalPrice: number;
  amountPaid: number;
  status: 'Confirmed' | 'Cancelled';
  paymentGatewayId?: string; // e.g., Razorpay Payment ID

  // Refund fields mirrored from Trip booking
  refundStatus?: 'none' | 'requested' | 'approved_by_organizer' | 'rejected_by_organizer' | 'processed' | 'rejected_by_admin';
  refundRequestDate?: string;
  refundRejectionReason?: string;
  refundProcessedDate?: string;
  approvedRefundAmount?: number;
  cancellationInitiator?: 'traveler' | 'organizer' | 'admin';
  cancellationReason?: string;
  refundUtr?: string; // Can now store the gateway's refund ID
};
