

/**
 * @file This file serves as the master source for all initial, static mock data used in the prototype.
 * It simulates a database by providing raw, structured data that is then loaded into the live application state.
 * This centralized approach allows for easy management and consistency of mock data across the entire platform.
 */

import type { Trip, BlogStory, Organizer, Booking, Coupon, WalletTransaction, Referral, Review, Lead, LeadPackage, FAQ, User, AuditLog, Experience, ExperienceVendor, ExperienceBooking } from "@/lib/types";
import { subDays } from 'date-fns';


// --- USERS ---
export const initialUsers: User[] = [
  { id: 'user-john-doe', name: 'John Doe', phone: '+917777777777', email: 'johndoe@example.com', role: 'traveler', joinDate: subDays(new Date(), 30).toISOString(), status: 'active', walletBalance: 1500, subscriptionTier: 'pro', subscriptionHistory: [{ id: 'sub_123', planId: 'pro-annual', planName: 'Travonex Pro - Annual Plan', status: 'active', startDate: '2024-01-01', endDate: '2025-01-01', pricePaid: 5988 }] },
  { id: 'user-alice-johnson', name: 'Alice Johnson', phone: '+917777777771', email: 'alice.j@example.com', role: 'traveler', joinDate: subDays(new Date(), 60).toISOString(), status: 'active', walletBalance: 250, subscriptionTier: 'free' },
  { id: 'user-bob-williams', name: 'Bob Williams', phone: '+917777777772', email: 'bob.w@example.com', role: 'traveler', joinDate: subDays(new Date(), 5).toISOString(), status: 'active', walletBalance: 0, subscriptionTier: 'free' },
  { id: 'user-charlie-brown', name: 'Charlie Brown', phone: '+919876543212', email: 'charlie.b@example.com', role: 'traveler', joinDate: subDays(new Date(), 90).toISOString(), status: 'suspended' },
  { id: 'user-diana-prince', name: 'Diana Prince', phone: '+919876543213', email: 'diana.p@example.com', role: 'traveler', joinDate: subDays(new Date(), 120).toISOString(), status: 'active' },
  { id: 'user-frank-miller', name: 'Frank Miller', phone: '+919876543215', email: 'frank.m@example.com', role: 'traveler', joinDate: subDays(new Date(), 10).toISOString(), status: 'active' },
  { id: 'user-admin', name: 'Admin User', phone: '+919999999999', email: 'admin@travonex.com', role: 'admin', joinDate: subDays(new Date(), 365).toISOString(), status: 'active'},
  { id: 'user-adventure-seekers', name: 'Adventure Seekers', phone: '+918888888888', email: 'organizer@travonex.com', role: 'organizer', organizerId: 'adventure-seekers', partnerType: 'trip', joinDate: subDays(new Date(), 200).toISOString(), status: 'active'},
  { id: 'user-aqua-adventures', name: 'Aqua Adventures', phone: '+918888888884', email: 'contact@aqua.com', role: 'organizer', organizerId: 'aqua-adventures', partnerType: 'experience', joinDate: subDays(new Date(), 150).toISOString(), status: 'active' },
];


// --- ORGANIZERS ---
// This record holds all trip organizers. The key is a unique ID for each organizer.
// This data is used to populate organizer details on trip pages and for role-based access.
export const initialOrganizers: Record<string, Organizer> = {
  'adventure-seekers': {
    id: "adventure-seekers",
    name: "Adventure Seekers",
    avatar: "organizer1",
    isVerified: true,
    status: 'approved',
    partnerType: 'trip',
    leadCredits: 15,
    bio: "Specializing in high-altitude treks and off-beat road trips. We are a team of certified mountaineers and passionate explorers dedicated to providing safe and unforgettable adventures.",
    websiteUrl: "https://example.com",
    instagramUrl: "https://instagram.com/example",
    application: {
        organizerType: 'business',
        companyName: 'Adventure Seekers Pvt. Ltd.',
        experience: 'Founded in 2018, we have led over 200 treks and expeditions across the Indian Himalayas. Our focus is on safety, sustainability, and providing authentic experiences.',
        website: 'https://adventureseekers.com',
        contactName: 'Rohan Sharma',
        contactEmail: 'rohan@adventureseekers.com',
        contactPhone: '+919876543210',
        businessPan: 'ASPL_PAN.pdf',
        gstCertificate: 'ASPL_GST.pdf',
        businessRegistration: 'ASPL_REG.pdf',
        bankStatement: 'ASPL_BANK.pdf',
        bankAccountName: 'Adventure Seekers Pvt Ltd',
        bankAccountNumber: '123456789012',
        bankIfscCode: 'HDFC0001234',
        partnerType: 'trip'
    }
  },
  'weekend-wanderers': {
    id: "weekend-wanderers",
    name: "Weekend Wanderers",
    avatar: "organizer1",
    isVerified: true,
    status: 'approved',
    partnerType: 'trip',
    leadCredits: 8,
    bio: "We focus on quick and refreshing weekend getaways from major cities. Perfect for a short break from the hustle and bustle, our trips are all-inclusive and hassle-free."
  },
  'himalayan-explorers': {
    id: 'himalayan-explorers',
    name: 'Himalayan Explorers',
    avatar: 'organizer1',
    isVerified: false,
    status: 'pending',
    partnerType: 'trip',
    leadCredits: 0,
    application: {
        organizerType: 'individual',
        companyName: 'Himalayan Explorers',
        experience: '5 years of experience leading treks in the Himalayas. Specializing in off-beat trails.',
        website: 'https://himalayanexplorers.com',
        panCard: 'DUMMY_PAN.pdf',
        idProof: 'DUMMY_AADHAR.pdf',
        bankStatement: 'DUMMY_BANK.pdf',
        contactName: 'Sonam Wangchuk',
        contactEmail: 'sonam@himalayanexplorers.com',
        contactPhone: '+919988776655',
        bankAccountName: 'Sonam Wangchuk',
        bankAccountNumber: '987654321098',
        bankIfscCode: 'SBIN0009876',
        partnerType: 'trip'
    }
  },
  'wanderlust-adventures': {
    id: 'wanderlust-adventures',
    name: 'Wanderlust Adventures',
    avatar: 'organizer1',
    isVerified: true,
    status: 'approved',
    partnerType: 'trip',
    leadCredits: 25,
    bio: "From the deserts of Rajasthan to the backwaters of Kerala, we organize immersive cultural tours across India. Our goal is to connect travelers with the heart and soul of a place."
  },
  'city-escapes-co': {
    id: 'city-escapes-co',
    name: 'City Escapes Co.',
    avatar: 'organizer1',
    isVerified: false,
    status: 'agreement_sent',
    partnerType: 'trip',
    leadCredits: 0,
     application: {
        organizerType: 'business',
        companyName: 'City Escapes Co.',
        experience: 'We organize curated heritage walks and city tours. We have a team of 5 guides.',
        businessPan: 'DUMMY_BUS_PAN.pdf',
        gstCertificate: 'DUMMY_GST.pdf',
        businessRegistration: 'DUMMY_REG.pdf',
        bankStatement: 'DUMMY_BUS_BANK.pdf',
        contactName: 'Aisha Khan',
        contactEmail: 'aisha@cityescapes.co',
        contactPhone: '+919123456789',
        bankAccountName: 'City Escapes Collective',
        bankAccountNumber: '567890123456',
        bankIfscCode: 'ICIC0005678',
        partnerType: 'trip'
    },
    adminRemarks: "The business registration document seems to be expired. Please upload a renewed copy.",
  },
  'aqua-adventures': {
    id: 'aqua-adventures',
    name: 'Aqua Adventures',
    avatar: 'organizer1',
    isVerified: true,
    status: 'approved',
    partnerType: 'experience',
    leadCredits: 5,
    bio: "Your premier destination for water sports in Goa. We offer everything from Scuba Diving to Jet Skiing with a focus on safety and fun.",
    application: {
      partnerType: 'experience',
      organizerType: 'business',
      companyName: 'Aqua Adventures',
      experience: '10+ years in water sports training and tourism.',
      contactName: 'Maria D\'Souza',
      contactEmail: 'maria@aqua.com',
      contactPhone: '+918888888884'
    }
  },
  'river-runners': {
    id: 'river-runners',
    name: 'River Runners Inc.',
    isVerified: false,
    status: 'approved',
    partnerType: 'experience',
    leadCredits: 2,
    bio: 'Rishikesh-based rafting and kayaking experts.',
    application: {
      partnerType: 'experience',
      organizerType: 'business',
      companyName: 'River Runners Inc.',
      experience: 'Certified river guides leading expeditions since 2015.',
      contactName: 'Sanjay Rana',
      contactEmail: 'sanjay@riverrunners.com',
      contactPhone: '+918888888885'
    }
  },
};

export const initialReviews: Review[] = [
    { id: 'rev-1', tripId: '1', author: 'Priya Sharma', avatar: 'user1', rating: 5, comment: 'Absolutely breathtaking! The views were worth every step. The guide was fantastic.', date: '2024-04-15' },
    { id: 'rev-2', tripId: '1', author: 'Arjun Verma', avatar: 'user1', rating: 4, comment: 'A challenging but rewarding trek. The scenery is amazing. The food could have been better, but overall a great experience.', date: '2024-04-16' },
    { id: 'rev-3', tripId: '2', author: 'Sameer Khan', avatar: 'user1', rating: 5, comment: 'The best way to see Goa! The scooters were in great condition and the route was perfect.', date: '2024-05-01' },
    { id: 'rev-4', tripId: '1', author: 'Anika Reddy', avatar: 'user1', rating: 5, comment: 'Our guide, Ramesh, was knowledgeable and made the trek so much fun. Highly recommend!', date: '2024-04-20' },
    { id: 'exp-rev-1', experienceId: 'exp-scuba-goa', author: 'John Doe', avatar: 'user1', rating: 5, comment: 'Incredible first dive! The instructors at Aqua Adventures were so patient and professional. Saw amazing coral and fish.', date: '2024-09-10' },
    { id: 'exp-rev-2', experienceId: 'exp-scuba-goa', author: 'Alice Johnson', avatar: 'user1', rating: 4, comment: 'A really fun experience. The water was a bit murky on our day, but the team made sure we had a good time regardless.', date: '2024-09-11' },
    { id: 'exp-rev-3', experienceId: 'exp-paragliding-bir', author: 'Bob Williams', avatar: 'user1', rating: 5, comment: 'Flying over the Himalayas is an experience I will never forget. Sky High team was brilliant, felt completely safe.', date: '2024-08-20' },
    { id: 'exp-rev-4', experienceId: 'exp-pottery-jaipur', author: 'Diana Prince', avatar: 'user1', rating: 5, comment: 'Such a therapeutic and fun workshop! The instructor was very talented and I actually made a decent-looking pot!', date: '2024-09-01' },
    { id: 'exp-rev-5', experienceId: 'exp-food-mumbai', author: 'Frank Miller', avatar: 'user1', rating: 5, comment: 'Best way to experience Mumbai street food. The guide knew all the hidden gems. Came with an empty stomach, left with a happy heart.', date: '2024-09-05' },
    { id: 'exp-rev-6', experienceId: 'exp-yoga-rishikesh', author: 'John Doe', avatar: 'user1', rating: 5, comment: 'The sunrise yoga session by the Ganges was magical. A truly rejuvenating experience.', date: '2024-09-15' },
    { id: 'exp-rev-7', experienceId: 'exp-cooking-goa', author: 'Alice Johnson', avatar: 'user1', rating: 5, comment: 'Loved learning how to cook authentic Goan seafood curry. The chef was hilarious and very skilled.', date: '2024-09-12' },
];

// --- Function to get a date in the next month ---
const getNextMonthDate = (day: number): string => {
    const today = new Date();
    // Set to next month. If current month is December, year will increment automatically.
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return nextMonth.toISOString().split('T')[0];
}

// --- NEW EXPERIENCE DATA ---
export const initialExperienceVendors: Record<string, ExperienceVendor> = {
  'aqua-adventures': { id: 'aqua-adventures', name: 'Aqua Adventures', isVerified: true, avatar: 'organizer1' },
  'sky-high-paragliding': { id: 'sky-high-paragliding', name: 'Sky High Paragliding', isVerified: true, avatar: 'organizer1' },
  'river-runners': { id: 'river-runners', name: 'River Runners Inc.', isVerified: false, avatar: 'organizer1' },
  'nature-trails': { id: 'nature-trails', name: 'Nature Trails', isVerified: true, avatar: 'organizer1' },
  'urban-eats': { id: 'urban-eats', name: 'Urban Eats', isVerified: true, avatar: 'organizer1' },
  'creative-hands': { id: 'creative-hands', name: 'Creative Hands Studio', isVerified: false, avatar: 'organizer1' },
  'serene-spirit': { id: 'serene-spirit', name: 'Serene Spirit Yoga', isVerified: true, avatar: 'organizer1' },
  'goan-flavors': { id: 'goan-flavors', name: 'Goan Flavors', isVerified: true, avatar: 'organizer1' },
  'mumbai-night-owls': { id: 'mumbai-night-owls', name: 'Mumbai Night Owls', isVerified: false, avatar: 'organizer1' },
};

export const initialExperiences: Experience[] = [
  {
    id: 'exp-scuba-goa',
    slug: 'scuba-diving-grande-island-goa',
    title: 'Scuba Diving in Grande Island',
    location: 'Goa',
    category: 'Water',
    price: 2499,
    duration: '45 Mins',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    highlights: ['PADI Certified Instructors', 'Underwater Photos & Videos', 'Dolphin Sighting', 'Snacks & Refreshments'],
    description: 'Discover the vibrant underwater world of Goa with our beginner-friendly scuba diving experience at Grande Island. No prior swimming knowledge is required. Our PADI-certified instructors will guide you every step of the way, ensuring a safe and unforgettable adventure. Explore beautiful coral reefs, swim with colorful fish, and create memories that will last a lifetime.',
    inclusions: ['All equipment', 'Instructor fees', 'Boat trip to island', 'Light snacks'],
    exclusions: ['Towels', 'Swimsuit'],
    safetyNotes: 'All participants must be over 10 years of age and in good health. A medical declaration form will be required.',
    cancellationPolicy: 'Full refund on cancellation 48 hours prior. No refund within 48 hours.',
    images: ['exp1', 'trip5', 'trip6'],
    vendor: initialExperienceVendors['aqua-adventures'],
    availability: { type: 'daily', timeSlots: ['09:00', '11:00', '14:00'] },
    reviews: initialReviews.filter(r => r.experienceId === 'exp-scuba-goa'),
    pickupPoints: [
      { location: "Calangute Circle", time: "8:00 AM", address: "Main Calangute Circle, Near the market", mapLink: "https://maps.google.com" },
      { location: "Candolim Beach Entrance", time: "8:30 AM", address: "Main entrance to Candolim beach", mapLink: "https://maps.google.com" },
    ],
  },
  {
    id: 'exp-paragliding-bir',
    slug: 'paragliding-in-bir-billing',
    title: 'Paragliding in Bir Billing',
    location: 'Bir',
    category: 'Aerial',
    price: 3000,
    duration: '20-30 Mins',
    difficulty: 'All Levels',
    highlights: ['Asia\'s highest paragliding spot', 'GoPro video included', 'Tandem flight with expert pilot'],
    description: 'Soar like a bird over the stunning Kangra Valley with a tandem paragliding flight from Bir Billing, one of the best paragliding sites in the world. Enjoy breathtaking panoramic views of the Dhauladhar mountain range as you glide through the sky with an experienced pilot.',
    inclusions: ['Tandem flight', 'Certified Pilot', 'GoPro Video', 'Safety gear'],
    exclusions: ['Transport to launch site'],
    safetyNotes: 'Weight limit for participants is 25-90 kg. Flying is subject to weather conditions.',
    cancellationPolicy: 'Full refund if canceled due to weather. 50% refund on user cancellation 24 hours prior.',
    images: ['hero1', 'hero2', 'trip1'],
    vendor: initialExperienceVendors['sky-high-paragliding'],
    availability: { type: 'daily', timeSlots: ['10:00', '12:00', '15:00'] },
    reviews: initialReviews.filter(r => r.experienceId === 'exp-paragliding-bir'),
  },
  {
    id: 'exp-kayaking-rishikesh',
    slug: 'kayaking-on-the-ganges-rishikesh',
    title: 'Kayaking on the Ganges',
    location: 'Rishikesh',
    category: 'Water',
    price: 1500,
    duration: '2 Hours',
    difficulty: 'Beginner',
    highlights: ['Learn basics of kayaking', 'Paddle on the sacred Ganges', 'Minor rapids for beginners'],
    description: 'Experience the tranquility of the Ganges with a beginner-friendly kayaking session. Learn the basics from our expert guides and paddle through gentle rapids, surrounded by the beautiful Himalayan foothills of Rishikesh.',
    images: ['trip5', 'hero1', 'trip1'],
    vendor: initialExperienceVendors['river-runners'],
    availability: { type: 'daily', timeSlots: ['08:00', '16:00'] },
    inclusions: ['Kayak and paddle', 'Life jacket', 'Instructor'],
    exclusions: ['Transport to starting point'],
    safetyNotes: 'Non-swimmers are welcome. Must be physically fit.',
    cancellationPolicy: 'Full refund on cancellation 24 hours prior.',
  },
  {
    id: 'exp-jungle-safari-jim-corbett',
    slug: 'jungle-safari-in-jim-corbett',
    title: 'Jungle Safari in Jim Corbett',
    location: 'Ramnagar',
    category: 'Nature',
    price: 4500,
    duration: '3 Hours',
    difficulty: 'All Levels',
    highlights: ['Chance to spot a Royal Bengal Tiger', 'Open-jeep safari', 'Accompanied by a forest guide'],
    description: 'Venture deep into the wilderness of Jim Corbett National Park, India\'s oldest national park. This open-jeep safari offers a chance to spot incredible wildlife, including tigers, elephants, deer, and hundreds of species of birds.',
    images: ['trip3', 'hero2', 'blog1'],
    vendor: initialExperienceVendors['nature-trails'],
    availability: { type: 'daily', timeSlots: ['06:00', '14:00'] },
    inclusions: ['Jeep rental', 'Forest entry permits', 'Guide fees'],
    exclusions: ['Travel to Ramnagar', 'Camera fees'],
    safetyNotes: 'Follow the guide\'s instructions at all times. Do not get down from the jeep inside the park.',
    cancellationPolicy: 'Permits are non-refundable once booked.',
  },
  {
    id: 'exp-food-mumbai',
    slug: 'mumbai-street-food-tour',
    title: 'Mumbai Street Food Tour',
    location: 'Mumbai',
    category: 'Local Tours',
    price: 1800,
    duration: '3 Hours',
    difficulty: 'All Levels',
    highlights: ['Taste iconic Mumbai street food', 'Visit legendary food stalls', 'Guided by a local food expert'],
    description: 'Dive into the culinary heart of Mumbai with this guided street food tour. From spicy Vada Pav to sweet Jalebis, you\'ll sample a variety of iconic dishes that define this city\'s vibrant food culture.',
    images: ['hero3', 'trip4', 'trip2'],
    vendor: initialExperienceVendors['urban-eats'],
    availability: { type: 'daily', timeSlots: ['17:00'] },
    inclusions: ['All food tastings at 6-8 stops', 'Services of a food guide'],
    exclusions: ['Hotel pickup and drop-off', 'Any extra food orders'],
    safetyNotes: 'Please inform us of any food allergies in advance.',
    reviews: initialReviews.filter(r => r.experienceId === 'exp-food-mumbai'),
  },
  {
    id: 'exp-pottery-jaipur',
    slug: 'blue-pottery-workshop-jaipur',
    title: 'Blue Pottery Workshop',
    location: 'Jaipur',
    category: 'Workshops',
    price: 1200,
    duration: '2 Hours',
    difficulty: 'Beginner',
    highlights: ['Learn the art of Jaipur\'s Blue Pottery', 'Create your own masterpiece', 'Taught by a master artisan'],
    description: 'Get your hands dirty and learn the traditional art of Blue Pottery in this immersive workshop. A master artisan will guide you through the process, from molding the clay to painting the intricate blue designs. You get to take your creation home as a unique souvenir!',
    images: ['blog2', 'trip6', 'trip3'],
    vendor: initialExperienceVendors['creative-hands'],
    availability: { type: 'daily', timeSlots: ['11:00', '15:00'] },
    inclusions: ['All materials', 'Instructor fees', 'Your finished pottery piece'],
    exclusions: ['Shipping of the final piece (if required)'],
    safetyNotes: 'Suitable for all ages. Wear clothes you don\'t mind getting a little dirty.',
    cancellationPolicy: 'Full refund on cancellation 24 hours prior.',
    reviews: initialReviews.filter(r => r.experienceId === 'exp-pottery-jaipur'),
  },
  {
    id: 'exp-yoga-rishikesh',
    slug: 'sunrise-yoga-by-the-ganges',
    title: 'Sunrise Yoga by the Ganges',
    location: 'Rishikesh',
    category: 'Wellness',
    price: 800,
    duration: '1.5 Hours',
    difficulty: 'All Levels',
    highlights: ['Yoga session at a scenic ghat', 'Certified yoga instructor', 'Pranayama and meditation included'],
    description: 'Start your day with a serene and energizing yoga session on the banks of the holy Ganges river. Connect your mind, body, and soul as you practice asanas, pranayama, and meditation, guided by an experienced instructor.',
    images: ['trip1', 'hero1', 'trip5'],
    vendor: initialExperienceVendors['serene-spirit'],
    availability: { type: 'daily', timeSlots: ['06:00'] },
    inclusions: ['Yoga mats', 'Instructor fees'],
    exclusions: ['Personal water bottle'],
    safetyNotes: 'Inform the instructor of any injuries or medical conditions beforehand.',
    cancellationPolicy: 'Full refund on cancellation 12 hours prior.',
    reviews: initialReviews.filter(r => r.experienceId === 'exp-yoga-rishikesh'),
  },
  {
    id: 'exp-cooking-goa',
    slug: 'authentic-goan-cooking-class',
    title: 'Authentic Goan Cooking Class',
    location: 'Goa',
    category: 'Food & Drink',
    price: 2200,
    duration: '3 Hours',
    difficulty: 'Beginner',
    highlights: ['Learn to cook 3-4 Goan dishes', 'Hands-on experience', 'Enjoy the meal you prepared'],
    description: 'Uncover the secrets of Goan cuisine in this fun, hands-on cooking class. Learn from a local chef how to prepare classic dishes like Goan Fish Curry, Vindaloo, or Bebinca, and then enjoy the delicious meal you\'ve created.',
    images: ['hero3', 'trip2', 'trip4'],
    vendor: initialExperienceVendors['goan-flavors'],
    availability: { type: 'daily', timeSlots: ['12:00', '18:00'] },
    inclusions: ['All ingredients', 'Chef instructor', 'Recipe notes', 'Lunch/Dinner'],
    exclusions: ['Alcoholic beverages'],
    safetyNotes: 'Please inform us of any food allergies.',
    cancellationPolicy: 'Full refund on cancellation 24 hours prior.',
    reviews: initialReviews.filter(r => r.experienceId === 'exp-cooking-goa'),
  },
  {
    id: 'exp-nightlife-mumbai',
    slug: 'mumbai-nightlife-pub-crawl',
    title: 'Mumbai Nightlife Pub Crawl',
    location: 'Mumbai',
    category: 'Entertainment',
    price: 1500,
    duration: '4 Hours',
    difficulty: 'All Levels',
    highlights: ['Visit 3-4 popular pubs/bars', 'Includes complimentary shots', 'Hosted by a fun nightlife guide'],
    description: 'Experience the vibrant nightlife of Mumbai with a guided pub crawl through the city\'s trendiest neighborhoods. Meet new people, enjoy complimentary drinks, and dance the night away.',
    images: ['hero2', 'trip2', 'trip4'],
    vendor: initialExperienceVendors['mumbai-night-owls'],
    availability: { type: 'weekends', timeSlots: ['20:00'] },
    inclusions: ['Guide fees', '1 complimentary shot at each venue'],
    exclusions: ['Additional drinks and food', 'Cover charges if applicable'],
    safetyNotes: 'Must be of legal drinking age. Please drink responsibly. Do not drink and drive.',
    cancellationPolicy: 'Full refund on cancellation 24 hours prior.',
    reviews: [],
  },
];

export const initialExperienceBookings: ExperienceBooking[] = [
    {
        id: 'exp-booking-1',
        experienceId: 'exp-scuba-goa',
        experienceTitle: 'Scuba Diving in Grande Island',
        travelerId: 'user-john-doe',
        travelerName: 'John Doe',
        travelerPhone: '+917777777777',
        bookingDate: '2024-09-01',
        activityDate: '2024-09-10',
        timeSlot: '09:00',
        participants: 2,
        totalPrice: 4998,
        amountPaid: 4998,
        status: 'Confirmed',
    },
    {
        id: 'exp-booking-2',
        experienceId: 'exp-paragliding-bir',
        experienceTitle: 'Paragliding in Bir Billing',
        travelerId: 'user-alice-johnson',
        travelerName: 'Alice Johnson',
        travelerPhone: '+917777777771',
        bookingDate: '2024-08-15',
        activityDate: '2024-08-20',
        timeSlot: '12:00',
        participants: 1,
        totalPrice: 3000,
        amountPaid: 3000,
        status: 'Confirmed',
        refundStatus: 'approved_by_organizer', // For admin queue
        refundRequestDate: '2024-08-16',
        cancellationReason: 'Trip plan changed.'
    },
     {
        id: 'exp-booking-3',
        experienceId: 'exp-yoga-rishikesh',
        experienceTitle: 'Sunrise Yoga by the Ganges',
        travelerId: 'user-john-doe',
        travelerName: 'John Doe',
        travelerPhone: '+917777777777',
        bookingDate: '2024-09-10',
        activityDate: '2024-09-15',
        timeSlot: '06:00',
        participants: 1,
        totalPrice: 800,
        amountPaid: 800,
        status: 'Confirmed',
    },
    {
        id: 'exp-booking-4-refund',
        experienceId: 'exp-kayaking-rishikesh',
        experienceTitle: 'Kayaking on the Ganges',
        travelerId: 'user-diana-prince',
        travelerName: 'Diana Prince',
        travelerPhone: '+919876543213',
        bookingDate: '2024-10-01',
        activityDate: '2024-10-20',
        timeSlot: '08:00',
        participants: 2,
        totalPrice: 3000,
        amountPaid: 3000,
        status: 'Confirmed',
        refundStatus: 'requested', // For vendor queue
        refundRequestDate: '2024-10-02',
    },
    // Mock data for history
    {
        id: 'exp-booking-hist-1',
        experienceId: 'exp-food-mumbai',
        experienceTitle: 'Mumbai Street Food Tour',
        travelerId: 'user-frank-miller',
        travelerName: 'Frank Miller',
        travelerPhone: '+919876543215',
        bookingDate: '2024-08-01',
        activityDate: '2024-08-05',
        timeSlot: '17:00',
        participants: 2,
        totalPrice: 3600,
        amountPaid: 3600,
        status: 'Cancelled',
        refundStatus: 'processed',
        refundRequestDate: '2024-08-02',
        refundProcessedDate: '2024-08-04',
        refundUtr: 'rfnd_exp_mock123'
    },
    {
        id: 'exp-booking-hist-2',
        experienceId: 'exp-pottery-jaipur',
        experienceTitle: 'Blue Pottery Workshop',
        travelerId: 'user-charlie-brown',
        travelerName: 'Charlie Brown',
        travelerPhone: '+919876543212',
        bookingDate: '2024-07-20',
        activityDate: '2024-07-25',
        timeSlot: '11:00',
        participants: 1,
        totalPrice: 1200,
        amountPaid: 1200,
        status: 'Confirmed',
        refundStatus: 'rejected_by_organizer',
        refundRequestDate: '2024-07-21',
        refundRejectionReason: 'Cancellation request received after the 24-hour policy window.'
    },
];
// --- TRIPS ---
// This array contains all trip listings available on the platform.
// Each trip object is linked to an organizer from the `initialOrganizers` record.
export const initialTrips: Trip[] = [
  {
    id: "1",
    slug: "himalayan-peak-trek",
    title: "Himalayan Peak Trek",
    category: "Treks",
    location: "Manali, Himachal Pradesh",
    departureCity: "Manali",
    duration: "3 Days, 2 Nights",
    price: 4999,
    rating: 4.8,
    reviewsCount: 120,
    shortDescription: "Conquer breathtaking peaks and witness stunning Himalayan vistas.",
    description: "Embark on a thrilling trek through the heart of the Himalayas. This adventure is perfect for both novice and experienced trekkers, offering a chance to disconnect and embrace the wild. The journey will take you through lush green valleys, dense forests, and finally to a majestic peak offering panoramic views of the surrounding snow-capped mountains.",
    image: "trip1",
    gallery: ["trip2", "trip3", "hero1", "hero_invoice"],
    organizer: initialOrganizers['adventure-seekers'],
    itinerary: [
      { day: 1, title: "Arrival in Manali & Acclimatization", description: "Arrive at our base camp in Manali, get briefed by our trek leader, and spend the day acclimatizing to the high altitude. A short walk around the area is recommended." },
      { day: 2, title: "Trek to High Camp", description: "A challenging yet rewarding 6-hour trek to our high-altitude camp. The trail winds through forests of pine and oak. Enjoy panoramic views and a bonfire in the evening." },
      { day: 3, title: "Summit Push & Return", description: "An early start to summit the peak for a glorious sunrise view over the Pir Panjal range, followed by the descent back to base camp with memories to last a lifetime." },
    ],
    inclusions: ["Accommodation (tents)", "All meals on trek", "Certified trek guide", "Necessary permits"],
    exclusions: ["Travel to/from Manali", "Personal expenses", "Equipment rental (available on request)"],
    status: 'published',
    difficulty: 'Moderate',
    minAge: 18,
    maxAge: 45,
    highlights: ["Panoramic Himalayan views", "Sunrise from the summit", "Bonfire at high camp", "Stargazing"],
    batches: [
      { id: "batch-1-1", startDate: "2024-04-10", endDate: "2024-04-12", availableSlots: 0, status: "Inactive" },
      { id: "batch-1-2", startDate: "2024-10-15", endDate: "2024-10-17", availableSlots: 0, status: "Full" },
      { id: "batch-1-3", startDate: getNextMonthDate(5), endDate: getNextMonthDate(7), availableSlots: 10, status: "Active", isLastMinuteDeal: true, dealPrice: 3999 },
    ],
    pickupPoints: [
      { location: "Manali Mall Road", time: "8:00 AM", address: "Main Mall Road, Near HDFC Bank", mapLink: "https://maps.google.com" },
      { location: "Old Manali Bridge", time: "8:30 AM", address: "Bridge connecting Old Manali", mapLink: "https://maps.google.com" },
    ],
    dropoffPoints: [
      { location: "Manali Mall Road", time: "6:00 PM", address: "Main Mall Road, Near HDFC Bank", mapLink: "https://maps.google.com" },
    ],
    cancellationPolicy: "Full refund if cancelled 30 days prior. 50% refund if cancelled 15 days prior. No refund within 15 days of departure.",
    faqs: [
      { question: "What is the fitness level required?", answer: "A moderate level of fitness is required. You should be able to walk for 5-6 hours a day." },
      { question: "What kind of accommodation is provided?", answer: "Accommodation will be in comfortable trekking tents on a sharing basis." },
    ],
    spotReservationEnabled: true,
    spotReservationPercentage: 10,
    balanceDueDays: 15,
    reviews: initialReviews.filter(r => r.tripId === '1'),
    reviewTags: [
      { tag: "Guide", count: 2 },
      { tag: "Scenery", count: 2 },
      { tag: "Challenging", count: 1 },
      { tag: "Food", count: 1 },
    ],
    isSuggested: true,
    videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
  },
  {
    id: "2",
    slug: "coastal-road-trip-goa",
    title: "Coastal Road Trip - Goa",
    category: "Road Trips",
    location: "Goa",
    departureCity: "Goa",
    duration: "2 Days, 1 Night",
    price: 3499,
    rating: 4.6,
    reviewsCount: 85,
    shortDescription: "Explore the scenic coastline of Goa on a thrilling road trip adventure.",
    description: "Discover hidden beaches, charming villages, and vibrant culture on this curated road trip. Feel the wind in your hair as you drive along the stunning Goan coast.",
    image: "trip2",
    organizer: initialOrganizers['weekend-wanderers'],
    itinerary: [
      { day: 1, title: "North Goa Exploration", description: "Start from Panjim and ride towards North Goa, visiting famous beaches and forts." },
      { day: 2, title: "South Goa Serenity", description: "Explore the tranquil and pristine beaches of South Goa before concluding the trip." },
    ],
    inclusions: ["Bike/Scooter rental", "Accommodation in a beach shack", "Breakfast", "Route map"],
    exclusions: ["Fuel", "Lunch & Dinner", "Entry fees"],
    status: 'published',
    spotReservationEnabled: true,
    spotReservationPercentage: 15,
    balanceDueDays: 7,
    batches: [
      { id: "batch-2-1", startDate: getNextMonthDate(20), endDate: getNextMonthDate(21), availableSlots: 8, status: "Active", isLastMinuteDeal: true, dealPrice: 2499 },
    ],
    faqs: [],
    reviews: initialReviews.filter(r => r.tripId === '2'),
  },
  {
    id: "3",
    slug: "lakeside-camping-pawna",
    title: "Lakeside Camping at Pawna",
    category: "Camping",
    location: "Pawna Lake, Maharashtra",
    departureCity: "Pune",
    duration: "2 Days, 1 Night",
    price: 2199,
    rating: 4.9,
    reviewsCount: 250,
    shortDescription: "Experience tranquility with lakeside camping, bonfire, and starry nights.",
    description: "Escape the city hustle and unwind by the serene Pawna Lake. Enjoy a perfect weekend getaway with camping, music, bonfire, and delicious barbecue.",
    image: "trip3",
    organizer: initialOrganizers['weekend-wanderers'],
    itinerary: [
      { day: 1, title: "Check-in and Lakeside Fun", description: "Arrive at the campsite, check into your tents, and enjoy evening snacks, bonfire, and music." },
      { day: 2, title: "Sunrise and Departure", description: "Wake up to a beautiful sunrise over the lake, enjoy breakfast, and check out with fond memories." },
    ],
    inclusions: ["Tent accommodation", "Evening snacks & BBQ", "Dinner & Breakfast", "Bonfire"],
    exclusions: ["Travel to campsite", "Personal expenses"],
    status: 'pending',
    spotReservationEnabled: true,
    spotReservationPercentage: 20,
    balanceDueDays: 10,
    batches: [
      { id: "batch-3-1", startDate: getNextMonthDate(25), endDate: getNextMonthDate(26), availableSlots: 15, status: "Active" },
    ],
    faqs: [],
    reviews: [],
  },
  {
    id: "4",
    slug: "coorg-coffee-plantation-stay",
    title: "Coorg Coffee Plantation Stay",
    category: "Weekend Getaways",
    location: "Coorg, Karnataka",
    departureCity: "Bangalore",
    duration: "3 Days, 2 Nights",
    price: 6999,
    rating: 4.7,
    reviewsCount: 95,
    shortDescription: "A refreshing getaway amidst the aromatic coffee estates of Coorg.",
    description: "Immerse yourself in the lush greenery of Coorg with a stay in a traditional coffee plantation. Learn about coffee making, explore spice gardens, and rejuvenate your senses.",
    image: "trip4",
    organizer: initialOrganizers['adventure-seekers'],
    itinerary: [
      { day: 1, title: "Arrival and Plantation Walk", description: "Check into your homestay and take a guided walk through the coffee and spice plantations." },
      { day: 2, title: "Explore Coorg", description: "Visit local attractions like Abbey Falls, Raja's Seat, and the Dubare Elephant Camp." },
      { day: 3, title: "Coffee Tasting & Departure", description: "Enjoy a coffee tasting session before departing." },
    ],
    inclusions: ["Accommodation", "All meals", "Plantation tour", "Coffee tasting"],
    exclusions: ["Travel to Coorg", "Sightseeing travel", "Entry fees"],
    status: 'published',
    spotReservationEnabled: true,
    spotReservationPercentage: 10,
    balanceDueDays: 14,
     batches: [
      { id: "batch-4-1", startDate: getNextMonthDate(1), endDate: getNextMonthDate(3), availableSlots: 6, status: "Active" },
      { id: "batch-4-2", startDate: "2024-05-10", endDate: "2024-05-12", availableSlots: 0, status: "Inactive" },
    ],
    faqs: [],
    reviews: [],
    isSuggested: true,
  },
  {
    id: "5",
    slug: "rishikesh-river-rafting",
    title: "Rishikesh River Rafting",
    category: "Weekend Getaways",
    location: "Rishikesh, Uttarakhand",
    departureCity: "Delhi",
    duration: "2 Days, 1 Night",
    price: 2999,
    rating: 4.9,
    reviewsCount: 310,
    shortDescription: "An adrenaline-pumping river rafting experience in the rapids of the Ganges.",
    description: "Challenge the mighty rapids of the Ganges in Rishikesh. This trip is packed with adventure, including river rafting, cliff jumping, and beach camping.",
    image: "trip5",
    organizer: initialOrganizers['adventure-seekers'],
    itinerary: [
        { day: 1, title: "Camp Arrival & Activities", description: "Arrive at the riverside camp, and indulge in camp activities, bonfire and music." },
        { day: 2, title: "River Rafting & Departure", description: "Experience the thrill of a 16km rafting stretch and then depart from Rishikesh." },
    ],
    inclusions: ["Riverside tent stay", "All meals", "Rafting with guide", "Bonfire"],
    exclusions: ["Travel to Rishikesh", "Personal expenses"],
    status: 'published',
    spotReservationEnabled: true,
    spotReservationPercentage: 10,
    balanceDueDays: 10,
     batches: [
      { id: "batch-5-1", startDate: getNextMonthDate(15), endDate: getNextMonthDate(16), availableSlots: 12, status: "Active", isLastMinuteDeal: true, dealPrice: 2299 },
    ],
    faqs: [],
    reviews: [],
  },
  {
    id: "6",
    slug: "jaisalmer-desert-safari",
    title: "Jaisalmer Desert Safari",
    category: "Camping",
    location: "Jaisalmer, Rajasthan",
    departureCity: "Jodhpur",
    duration: "2 Days, 1 Night",
    price: 3999,
    rating: 4.8,
    reviewsCount: 180,
    shortDescription: "An unforgettable night under the stars in the Thar Desert.",
    description: "Experience the magic of the desert with a camel safari at sunset, traditional Rajasthani folk dance and music, and an overnight stay in a desert camp.",
    image: "trip6",
    organizer: initialOrganizers['weekend-wanderers'],
    itinerary: [
        { day: 1, title: "Desert Arrival & Safari", description: "Reach the desert camp, go for a camel safari to the dunes, witness the sunset, and enjoy a cultural evening." },
        { day: 2, title: "Sunrise & Departure", description: "Wake up to the desert sunrise, have breakfast, and depart for Jaisalmer city." },
    ],
    inclusions: ["Camel Safari", "Cultural program", "Camp accommodation", "Dinner & Breakfast"],
    exclusions: ["Travel to Jaisalmer", "Personal expenses"],
    status: 'published',
    spotReservationEnabled: false,
     batches: [
      { id: "batch-6-1", startDate: "2024-03-20", endDate: "2024-03-21", availableSlots: 20, status: "Inactive" },
      { id: "batch-6-2", startDate: getNextMonthDate(20), endDate: getNextMonthDate(21), availableSlots: 18, status: "Active" },
    ],
    faqs: [],
    reviews: [],
  },
  {
    id: "7",
    slug: "spiti-valley-winter-expedition",
    title: "Spiti Valley Winter Expedition",
    category: "Road Trips",
    location: "Spiti Valley, Himachal Pradesh",
    departureCity: "Shimla",
    duration: "7 Days, 6 Nights",
    price: 18999,
    rating: 4.9,
    reviewsCount: 210,
    shortDescription: "A thrilling winter road trip through the surreal landscapes of Spiti.",
    description: "Embark on a once-in-a-lifetime journey to the snow-covered wonderland of Spiti Valley. This road trip is for the brave-hearted, offering stunning views, unique cultural experiences, and the thrill of navigating challenging terrains.",
    image: "hero2",
    organizer: initialOrganizers['wanderlust-adventures'],
    itinerary: [
        { day: 1, title: "Shimla to Kalpa", description: "Begin the scenic drive from Shimla, entering the Kinnaur valley." },
        { day: 2, title: "Kalpa to Tabo", description: "Drive towards Spiti valley, visiting Nako village and its serene lake." },
        { day: 3, title: "Tabo and Dhankar", description: "Explore the ancient Tabo Monastery and the spectacular Dhankar Monastery." },
        { day: 4, title: "Kaza and Key Monastery", description: "Reach Kaza, the administrative headquarters of Spiti, and visit the iconic Key Monastery." },
        { day: 5, title: "Langza, Hikkim, Komic", description: "Visit some of the highest motorable villages in the world and send a postcard from the world's highest post office." },
        { day: 6, title: "Return Journey to Kalpa", description: "Start the journey back, retracing the scenic route." },
        { day: 7, title: "Kalpa to Shimla", description: "Drive back to Shimla, concluding the epic winter expedition." },
    ],
    inclusions: ["Accommodation", "Breakfast & Dinner", "Transport in a 4x4", "Experienced Driver & Guide", "Permits"],
    exclusions: ["Lunches", "Personal Expenses", "Entry fees"],
    status: 'published',
    spotReservationEnabled: true,
    spotReservationPercentage: 25,
    balanceDueDays: 30,
    batches: [
      { id: "batch-7-1", startDate: getNextMonthDate(10), endDate: getNextMonthDate(16), availableSlots: 8, status: "Active" },
    ],
    faqs: [],
    reviews: [],
    isSuggested: true,
  },
  {
    id: "8",
    slug: "mumbai-heritage-walk",
    title: "Mumbai Heritage Walk",
    category: "Weekend Getaways",
    location: "Mumbai, Maharashtra",
    departureCity: "Mumbai",
    duration: "3 Hours",
    price: 899,
    rating: 4.7,
    reviewsCount: 150,
    shortDescription: "Discover the architectural marvels and hidden stories of South Mumbai.",
    description: "Join us for a guided walking tour through the historic streets of Colaba and Fort. Explore iconic landmarks, learn about the city's rich history, and discover hidden gems you might otherwise miss.",
    image: "hero3",
    organizer: initialOrganizers['city-escapes-co'],
    itinerary: [
      { day: 1, title: "Walking Tour", description: "Meet at the Gateway of India and walk through colonial-era buildings, ending at Crawford Market. The walk covers approximately 3 kilometers." },
    ],
    inclusions: ["Expert Guide", "A bottle of water"],
    exclusions: ["Transport to start point", "Snacks"],
    status: 'pending',
    spotReservationEnabled: false,
    batches: [
      { id: "batch-8-1", startDate: getNextMonthDate(1), endDate: getNextMonthDate(1), availableSlots: 20, status: "Active" },
    ],
    faqs: [],
    reviews: [],
  },
    {
    id: "9",
    slug: "hampi-boulder-weekend",
    title: "Hampi Bouldering Weekend",
    category: "Treks",
    location: "Hampi, Karnataka",
    departureCity: "Bangalore",
    duration: "3 Days, 2 Nights",
    price: 7500,
    rating: 4.9,
    reviewsCount: 180,
    shortDescription: "Climb the unique boulder landscapes of Hampi.",
    description: "A perfect weekend for climbing enthusiasts. Explore the unique boulder-strewn landscapes of Hampi, a UNESCO World Heritage Site. Includes bouldering sessions for all levels, from beginner to advanced, led by certified instructors.",
    image: "trip6",
    organizer: initialOrganizers['adventure-seekers'],
    itinerary: [
        { day: 1, title: "Travel & Sunset Sesh", description: "Overnight journey from Bangalore. Arrive in Hampi, check-in, and enjoy a sunset bouldering session." },
        { day: 2, title: "Full Day Bouldering & Exploration", description: "Spend the day bouldering at various spots around Hampi. In the evening, explore the ancient ruins and temples." },
        { day: 3, title: "Morning Climb & Departure", description: "One last morning climbing session before we pack up and start our journey back to Bangalore." },
    ],
    inclusions: ["Transportation from Bangalore (AC Bus)", "Accommodation", "Bouldering equipment rental", "Instructor fees", "Breakfast on Day 2 & 3"],
    exclusions: ["Lunches and Dinners", "Personal expenses"],
    status: 'published',
    spotReservationEnabled: true,
     balanceDueDays: 10,
     batches: [
      { id: "batch-9-1", startDate: getNextMonthDate(10), endDate: getNextMonthDate(12), availableSlots: 15, status: "Active" },
    ],
     faqs: [],
    reviews: [],
    isSuggested: true,
  },
  {
    id: "10",
    slug: "sundarbans-mangrove-tour",
    title: "Sundarbans Mangrove Tour",
    category: "Weekend Getaways",
    location: "Sundarbans, West Bengal",
    departureCity: "Kolkata",
    duration: "2 Days, 1 Night",
    price: 5500,
    rating: 4.8,
    reviewsCount: 90,
    shortDescription: "Explore the mystical mangrove forests of the Sundarbans.",
    description: "Venture into the world's largest mangrove forest, a UNESCO World Heritage Site, home to the Royal Bengal Tiger. This boat safari offers a unique chance to witness diverse wildlife and experience the serene yet wild nature of the Sundarbans.",
    image: "trip1",
    organizer: initialOrganizers['wanderlust-adventures'],
    itinerary: [
        { day: 1, title: "Journey to the Wild", description: "Drive from Kolkata to Godkhali, then board a boat to the resort. Post-lunch, explore the creeks and watchtowers." },
        { day: 2, title: "Boat Safari & Return", description: "Early morning boat safari through narrow creeks to spot wildlife. After breakfast, return to Kolkata." },
    ],
    inclusions: ["Kolkata to Kolkata transport", "Accommodation", "All meals", "Boat safari and guide", "Forest permits"],
    exclusions: ["Personal expenses", "Camera fees"],
    status: 'published',
    spotReservationEnabled: true,
    balanceDueDays: 15,
     batches: [
      { id: "batch-10-1", startDate: getNextMonthDate(12), endDate: getNextMonthDate(13), availableSlots: 10, status: "Active" },
    ],
     faqs: [],
    reviews: [],
    isSuggested: true,
  },
  {
    id: "11",
    slug: "pondicherry-french-quarter-cycle",
    title: "Pondicherry French Quarter Cycle",
    category: "Weekend Getaways",
    location: "Pondicherry",
    departureCity: "Chennai",
    duration: "1 Day",
    price: 1500,
    rating: 4.7,
    reviewsCount: 110,
    shortDescription: "Cycle through the charming French colonies of Pondicherry.",
    description: "Experience the unique blend of French and Tamil culture in Pondicherry on a guided cycling tour. Ride through the beautiful bougainvillea-laden streets of the White Town, explore quaint cafes, and visit the iconic landmarks.",
    image: "trip2",
    organizer: initialOrganizers['city-escapes-co'],
    itinerary: [
        { day: 1, title: "Cycle Tour", description: "Meet at the starting point, get your bicycle, and follow our guide through the French Quarter, Promenade Beach, and other famous spots. The tour ends with breakfast at a local cafe." },
    ],
    inclusions: ["Bicycle rental", "Experienced guide", "Breakfast"],
    exclusions: ["Transport to Pondicherry", "Lunch"],
    status: 'published',
    spotReservationEnabled: false,
     batches: [
      { id: "batch-11-1", startDate: getNextMonthDate(18), endDate: getNextMonthDate(18), availableSlots: 20, status: "Active" },
    ],
     faqs: [],
    reviews: [],
  },
   {
    id: "12",
    slug: "charminar-food-walk-hyderabad",
    title: "Charminar Food Walk",
    category: "Weekend Getaways",
    location: "Hyderabad, Telangana",
    departureCity: "Hyderabad",
    duration: "4 hours",
    price: 1200,
    rating: 4.9,
    reviewsCount: 200,
    shortDescription: "A culinary journey through the iconic food streets of Old Hyderabad.",
    description: "Taste the authentic flavors of Hyderabad on this guided food walk around the historic Charminar. Sample everything from world-famous biryani and kebabs to local delicacies and sweets in the bustling lanes of the old city.",
    image: "hero3",
    organizer: initialOrganizers['city-escapes-co'],
    itinerary: [
        { day: 1, title: "Food Walk", description: "Meet near Charminar and our food expert will guide you to the best and most hygienic local eateries to sample a variety of iconic Hyderabadi dishes." },
    ],
    inclusions: ["Expert food guide", "Tastings at 5-7 different spots"],
    exclusions: ["Transportation", "Any extra food orders"],
    status: 'published',
    spotReservationEnabled: false,
     batches: [
      { id: "batch-12-1", startDate: getNextMonthDate(19), endDate: getNextMonthDate(19), availableSlots: 15, status: "Active" },
    ],
     faqs: [],
    reviews: [],
  },
  {
    id: "13",
    slug: "jaipur-heritage-tour",
    title: "Jaipur Heritage Tour",
    category: "Weekend Getaways",
    location: "Jaipur, Rajasthan",
    departureCity: "Jaipur",
    duration: "2 Days, 1 Night",
    price: 4500,
    rating: 4.8,
    reviewsCount: 150,
    shortDescription: "Explore the royal forts and palaces of the Pink City.",
    description: "Immerse yourself in the royal history of Jaipur. This tour covers the magnificent Amber Fort, City Palace, Hawa Mahal, and the bustling local markets.",
    image: "trip5",
    organizer: initialOrganizers['wanderlust-adventures'],
    itinerary: [
      { day: 1, title: "Forts and Palaces", description: "Visit the Amber Fort in the morning, followed by the City Palace and Jantar Mantar." },
      { day: 2, title: "City Exploration & Shopping", description: "Explore Hawa Mahal and spend the afternoon shopping for local handicrafts in the Johari Bazaar." }
    ],
    inclusions: ["AC transportation", "Accommodation", "Breakfast", "Licensed guide"],
    exclusions: ["Entry fees", "Lunches & Dinners"],
    status: 'published',
    spotReservationEnabled: true,
    balanceDueDays: 10,
    batches: [{ id: "batch-13-1", startDate: getNextMonthDate(8), endDate: getNextMonthDate(9), availableSlots: 10, status: "Active" }],
    faqs: [],
    reviews: [],
  },
  {
    id: "14",
    slug: "kerala-backwaters-houseboat",
    title: "Kerala Backwaters Houseboat",
    category: "Weekend Getaways",
    location: "Alleppey, Kerala",
    departureCity: "Kochi",
    duration: "2 Days, 1 Night",
    price: 8500,
    rating: 4.9,
    reviewsCount: 220,
    shortDescription: "A tranquil overnight stay on a traditional houseboat in Alleppey.",
    description: "Experience the serenity of the Kerala backwaters. Cruise through the tranquil canals, witness village life, and enjoy authentic Keralan cuisine on a private houseboat.",
    image: "trip1",
    organizer: initialOrganizers['wanderlust-adventures'],
    itinerary: [
      { day: 1, title: "Houseboat Cruise", description: "Board the houseboat at noon. Cruise through the backwaters while lunch, dinner, and snacks are served onboard." },
      { day: 2, title: "Morning Cruise & Departure", description: "Wake up to the sounds of nature, enjoy breakfast on the cruise, and disembark by 9 AM." }
    ],
    inclusions: ["Private houseboat stay", "All meals on board", "Welcome drink"],
    exclusions: ["Transport to Alleppey", "Personal expenses"],
    status: 'published',
    spotReservationEnabled: true,
    balanceDueDays: 15,
    batches: [{ id: "batch-14-1", startDate: getNextMonthDate(14), endDate: getNextMonthDate(15), availableSlots: 5, status: "Active" }],
    faqs: [],
    reviews: [],
  },
  {
    id: "15",
    slug: "leh-ladakh-bike-expedition",
    title: "Leh-Ladakh Bike Expedition",
    category: "Road Trips",
    location: "Leh, Ladakh",
    departureCity: "Leh",
    duration: "7 Days, 6 Nights",
    price: 25000,
    rating: 5.0,
    reviewsCount: 300,
    shortDescription: "The ultimate motorbiking adventure to the 'Roof of the World'.",
    description: "Conquer the highest motorable passes in the world on this epic bike trip to Leh-Ladakh. Ride through dramatic landscapes, serene lakes, and ancient monasteries.",
    image: "hero1",
    organizer: initialOrganizers['adventure-seekers'],
    itinerary: [
      { day: 1, title: "Acclimatize in Leh", description: "Arrive in Leh and rest to acclimatize to the high altitude." },
      { day: 2, title: "Leh Local Sightseeing", description: "Explore local monasteries, Shanti Stupa, and Leh Palace." },
      { day: 3, title: "Ride to Nubra Valley via Khardung La", description: "Ride over the mighty Khardung La pass to reach the beautiful Nubra Valley." },
      { day: 4, title: "Nubra to Pangong Tso", description: "A scenic ride to the mesmerizing Pangong Lake." },
      { day: 5, title: "Pangong to Leh", description: "Ride back to Leh, enjoying the stunning vistas." },
      { day: 6, title: "Rest Day / Buffer Day", description: "A day to rest or explore Leh's markets." },
      { day: 7, title: "Departure", description: "Depart from Leh with unforgettable memories." }
    ],
    inclusions: ["Royal Enfield 500cc Bike", "Accommodation", "Mechanic and backup vehicle", "Permits", "Breakfast & Dinner"],
    exclusions: ["Fuel", "Lunches", "Riding gear"],
    status: 'published',
    spotReservationEnabled: true,
    balanceDueDays: 30,
    batches: [{ id: "batch-15-1", startDate: getNextMonthDate(22), endDate: getNextMonthDate(28), availableSlots: 10, status: "Active" }],
    faqs: [],
    reviews: [],
  },
  {
    id: "16",
    slug: "rann-of-kutch-festival",
    title: "Rann of Kutch Festival",
    category: "Weekend Getaways",
    location: "Kutch, Gujarat",
    departureCity: "Ahmedabad",
    duration: "3 Days, 2 Nights",
    price: 9500,
    rating: 4.8,
    reviewsCount: 180,
    shortDescription: "Experience the vibrant culture of Gujarat at the Rann Utsav.",
    description: "Visit the spectacular White Desert of Kutch during the Rann Utsav. Enjoy cultural performances, traditional handicrafts, and the unique experience of a tent city.",
    image: "trip3",
    organizer: initialOrganizers['wanderlust-adventures'],
    itinerary: [
      { day: 1, title: "Journey to the White Desert", description: "Travel from Ahmedabad to Dhordo Tent City. Witness the sunset over the white salt desert." },
      { day: 2, title: "Cultural Immersion", description: "Explore the tent city, enjoy cultural shows, and visit the highest point in Kutch, Kalo Dungar." },
      { day: 3, title: "Return Journey", description: "Enjoy a final sunrise over the Rann and then depart for Ahmedabad." }
    ],
    inclusions: ["AC transport from Ahmedabad", "Tent accommodation", "All meals", "Permits"],
    exclusions: ["Personal expenses", "Optional activities"],
    status: 'published',
    spotReservationEnabled: true,
    balanceDueDays: 20,
    batches: [{ id: "batch-16-1", startDate: getNextMonthDate(24), endDate: getNextMonthDate(26), availableSlots: 12, status: "Active" }],
    faqs: [],
    reviews: [],
  }
];

// --- BOOKINGS ---
// This array contains all booking records for all users, linking travelers to trips.
// This data populates the "My Bookings" page for users and the "Bookings" page for organizers.
export const initialBookings: Booking[] = [
  // --- PAST Bookings for John Doe (+917777777777) ---
  { id: 'booking-jd-1', tripId: '1', batchId: 'batch-1-1', tripTitle: 'Himalayan Peak Trek', travelerName: 'John Doe', travelerId: 'user-john-doe', travelerPhone: '+917777777777', bookingDate: '2024-03-20', totalPrice: 4999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 4999, balanceDue: 0, paymentStatus: 'Paid in Full' },
  { id: 'booking-jd-2', tripId: '4', batchId: 'batch-4-2', tripTitle: 'Coorg Coffee Plantation Stay', travelerName: 'John Doe', travelerId: 'user-john-doe', travelerPhone: '+917777777777', bookingDate: '2024-04-15', totalPrice: 6999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 6999, balanceDue: 0, paymentStatus: 'Paid in Full' },
  { id: 'booking-jd-3', tripId: '6', batchId: 'batch-6-1', tripTitle: 'Jaisalmer Desert Safari', travelerName: 'John Doe', travelerId: 'user-john-doe', travelerPhone: '+917777777777', bookingDate: '2024-02-01', totalPrice: 7998, organizerId: 'weekend-wanderers', numberOfTravelers: 2, paymentType: 'Full', amountPaid: 7998, balanceDue: 0, paymentStatus: 'Paid in Full' },
  // CANCELLED MOCK BOOKING (Trip 5's old batch was in march, now past due)
  { id: 'booking-jd-6-cancelled', tripId: '5', batchId: 'batch-5-1', tripTitle: 'Rishikesh River Rafting', travelerName: 'John Doe', travelerId: 'user-john-doe', travelerPhone: '+917777777777', bookingDate: '2024-01-01', totalPrice: 2999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Partial', amountPaid: 299.9, balanceDue: 2699.1, paymentStatus: 'Reserved' },
  
  
  // --- UPCOMING Bookings for various users for NEXT MONTH ---
  { id: 'booking-jd-upcoming-1', tripId: '1', batchId: 'batch-1-3', tripTitle: 'Himalayan Peak Trek', travelerName: 'John Doe', travelerId: 'user-john-doe', travelerPhone: '+917777777777', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 7998, organizerId: 'adventure-seekers', numberOfTravelers: 2, paymentType: 'Full', amountPaid: 7998, balanceDue: 0, paymentStatus: 'Paid in Full', coTravelers: [{ name: 'Jane Doe', email: 'jane@example.com', phone: '+917777777778', gender: 'Female' }] },
  { id: 'booking-aj-upcoming-1', tripId: '2', batchId: 'batch-2-1', tripTitle: 'Coastal Road Trip - Goa', travelerName: 'Alice Johnson', travelerId: 'user-alice-johnson', travelerPhone: '+917777777771', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 4998, organizerId: 'weekend-wanderers', numberOfTravelers: 2, paymentType: 'Partial', amountPaid: 749.7, balanceDue: 4248.3, paymentStatus: 'Reserved', coTravelers: [{ name: 'Alex Johnson', email: 'alex@example.com', phone: '+917777777779', gender: 'Male' }] },
  { id: 'booking-bw-upcoming-1', tripId: '5', batchId: 'batch-5-1', tripTitle: 'Rishikesh River Rafting', travelerName: 'Bob Williams', travelerId: 'user-bob-williams', travelerPhone: '+917777777772', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 2299, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 2299, balanceDue: 0, paymentStatus: 'Paid in Full' },
  { id: 'booking-jd-upcoming-2', tripId: '4', batchId: 'batch-4-1', tripTitle: 'Coorg Coffee Plantation Stay', travelerName: 'John Doe', travelerId: 'user-john-doe', travelerPhone: '+917777777777', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 6999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 6999, balanceDue: 0, paymentStatus: 'Paid in Full' },
  { id: 'booking-other-upcoming-1', tripId: '7', batchId: 'batch-7-1', tripTitle: 'Spiti Valley Winter Expedition', travelerName: 'Charlie Brown', travelerId: 'user-charlie-brown', travelerPhone: '+919876543212', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 18999, organizerId: 'wanderlust-adventures', numberOfTravelers: 1, paymentType: 'Partial', amountPaid: 4749.75, balanceDue: 14249.25, paymentStatus: 'Reserved' },

  // --- MOCK DATA FOR REFUND QUEUES ---
  { id: 'booking-refund-request-organizer', tripId: '9', batchId: 'batch-9-1', tripTitle: 'Hampi Bouldering Weekend', travelerName: 'Diana Prince', travelerId: 'user-diana-prince', travelerPhone: '+919876543213', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 7500, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 7500, balanceDue: 0, paymentStatus: 'Paid in Full', refundStatus: 'requested', refundRequestDate: new Date().toISOString() },
  { id: 'booking-refund-request-admin', tripId: '10', batchId: 'batch-10-1', tripTitle: 'Sundarbans Mangrove Tour', travelerName: 'Frank Miller', travelerId: 'user-frank-miller', travelerPhone: '+919876543215', bookingDate: new Date().toISOString().split('T')[0], totalPrice: 5500, organizerId: 'wanderlust-adventures', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 5500, balanceDue: 0, paymentStatus: 'Paid in Full', refundStatus: 'approved_by_organizer', refundRequestDate: new Date().toISOString(), approvedRefundAmount: 5500, cancellationReason: 'Personal emergency.' },
  { id: 'booking-refund-history-processed', tripId: '13', batchId: 'batch-13-1', tripTitle: 'Jaipur Heritage Tour', travelerName: 'Alice Johnson', travelerId: 'user-alice-johnson', travelerPhone: '+917777777771', bookingDate: subDays(new Date(), 20).toISOString(), totalPrice: 4500, organizerId: 'wanderlust-adventures', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 4500, balanceDue: 0, paymentStatus: 'Cancelled', refundStatus: 'processed', refundRequestDate: subDays(new Date(), 18).toISOString(), approvedRefundAmount: 4500, cancellationReason: 'Trip cancelled by organizer.', refundProcessedDate: subDays(new Date(), 15).toISOString(), refundUtr: 'rfnd_mock_12345' },
  { id: 'booking-refund-history-rejected', tripId: '14', batchId: 'batch-14-1', tripTitle: 'Kerala Backwaters Houseboat', travelerName: 'Bob Williams', travelerId: 'user-bob-williams', travelerPhone: '+917777777772', bookingDate: subDays(new Date(), 40).toISOString(), totalPrice: 8500, organizerId: 'wanderlust-adventures', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 8500, balanceDue: 0, paymentStatus: 'Paid in Full', refundStatus: 'rejected_by_organizer', refundRequestDate: subDays(new Date(), 10).toISOString(), refundRejectionReason: 'Cancellation request received after the 15-day policy window.' },


  // --- PAST Bookings for other users ---
  { id: 'booking-other-1', tripId: '1', batchId: 'batch-1-2', tripTitle: 'Himalayan Peak Trek', travelerName: 'Alice Johnson', travelerId: 'user-alice-johnson', travelerPhone: '+917777777771', bookingDate: '2023-10-01', totalPrice: 4999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 4999, balanceDue: 0, paymentStatus: 'Paid in Full' },
  { id: 'booking-other-2', tripId: '1', batchId: 'batch-1-2', tripTitle: 'Himalayan Peak Trek', travelerName: 'Bob Williams', travelerId: 'user-bob-williams', travelerPhone: '+917777777772', bookingDate: '2023-10-02', totalPrice: 9998, organizerId: 'adventure-seekers', numberOfTravelers: 2, paymentType: 'Full', amountPaid: 9998, balanceDue: 0, paymentStatus: 'Paid in Full' },
  { id: 'booking-other-3', tripId: '4', batchId: 'batch-4-2', tripTitle: 'Coorg Coffee Plantation Stay', travelerName: 'Charlie Brown', travelerId: 'user-charlie-brown', travelerPhone: '+919876543212', bookingDate: '2023-09-20', totalPrice: 6999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Partial', amountPaid: 699.9, balanceDue: 6299.1, paymentStatus: 'Reserved' }, // This would be cancelled in real logic
  { id: 'booking-other-4', tripId: '2', batchId: 'batch-2-1', tripTitle: 'Coastal Road Trip - Goa', travelerName: 'Diana Prince', travelerId: 'user-diana-prince', travelerPhone: '+919876543213', bookingDate: '2023-11-05', totalPrice: 2499, organizerId: 'weekend-wanderers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 2499, balanceDue: 0, paymentStatus: 'Paid in Full' }, // old batch, now past
  { id: 'booking-new-5', tripId: '1', batchId: 'batch-1-2', tripTitle: 'Himalayan Peak Trek', travelerName: 'Frank Miller', travelerId: 'user-frank-miller', travelerPhone: '+919876543215', bookingDate: '2024-09-22', totalPrice: 4999, organizerId: 'adventure-seekers', numberOfTravelers: 1, paymentType: 'Full', amountPaid: 4999, balanceDue: 0, paymentStatus: 'Paid in Full' },

];

// --- BLOG STORIES ---
// This array contains all blog posts for the Traveler Stories section.
export const initialBlogStories: BlogStory[] = [
  {
    id: "1",
    slug: "my-first-solo-trek",
    title: "My First Solo Trek: What I Learned in the Mountains",
    author: "Riya Sharma",
    date: "Oct 15, 2023",
    image: "blog1",
    excerpt: "Venturing into the mountains alone was daunting, but it taught me more about myself than I could have ever imagined...",
    content: "Full blog content goes here. It would be a longer markdown string detailing the journey, the challenges, and the beautiful moments of self-discovery during a solo trek."
  },
  {
    id: "2",
    slug: "a-guide-to-backpacking-essentials",
    title: "A Complete Guide to Backpacking Essentials for Beginners",
    author: "Arjun Verma",
    date: "Sep 28, 2023",
    image: "blog2",
    excerpt: "Packing for your first backpacking trip? Here’s a comprehensive checklist of everything you need, and what you can leave behind.",
    content: "Full blog content goes here. This would be a detailed guide with sections on clothing, gear, first-aid, and other essentials for a backpacking trip."
  },
  {
    id: "3",
    slug: "the-unseen-beauty-of-coastal-karnataka",
    title: "The Unseen Beauty of Coastal Karnataka",
    author: "Priya Das",
    date: "Sep 12, 2023",
    image: "trip2",
    excerpt: "Beyond Goa, there's a stretch of coastline that remains one of India's best-kept secrets. Here's my journey exploring it.",
    content: "Full blog content goes here. A travelogue about exploring the beaches and towns along the coast of Karnataka."
  },
];

// --- COUPONS ---
// This array holds all promotional coupons.
// They can be global (admin-created) or organizer-specific.
export const initialCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'WEEKEND10',
    type: 'percentage',
    value: 10,
    description: '10% off your next trip!',
    scope: 'global',
    isActive: true,
  },
  {
    id: 'coupon-2',
    code: 'SEEKADVENTURE',
    type: 'fixed',
    value: 500,
    description: '₹500 off for Adventure Seeker trips',
    scope: 'organizer',
    organizerId: 'adventure-seekers',
    isActive: true,
  },
  {
    id: 'coupon-3',
    code: 'WANDERMORE',
    type: 'fixed',
    value: 250,
    description: '₹250 off for Weekend Wanderers trips',
    scope: 'organizer',
    organizerId: 'weekend-wanderers',
    isActive: true,
  },
];

// --- WALLET TRANSACTIONS ---
// A complete log of all credits and debits to user wallets.
// Powers the user's `/dashboard/wallet` page.
export const initialWalletTransactions: WalletTransaction[] = [
    { id: 'txn-1', userId: 'user-john-doe', date: '2024-10-01', description: 'Referral bonus from new user Priya', amount: 500, type: 'credit' },
    { id: 'txn-2', userId: 'user-john-doe', date: '2024-10-15', description: 'Used on booking for Himalayan Peak Trek', amount: -250, type: 'debit' },
    { id: 'txn-3', userId: 'user-alice-johnson', date: '2024-10-05', description: 'Welcome bonus', amount: 250, type: 'credit' },
];

// --- REFERRALS ---
// A log of all successful user-to-user referrals.
// Powers the admin's `/management/referrals` dashboard.
export const initialReferrals: Referral[] = [
    { id: 'ref-1', referrerId: 'user-john-doe', referrerName: 'John Doe', referredUserId: 'user-priya', referredUserName: 'Priya Patel', date: '2024-10-01', bonusAmount: 500, status: 'Credited' },
     { id: 'ref-2', referrerId: 'user-alice-johnson', referrerName: 'Alice Johnson', referredUserId: 'user-mike', referredUserName: 'Mike Ross', date: '2024-09-28', bonusAmount: 500, status: 'Credited' },
];

// --- LEADS ---
// This array will hold all traveler inquiries generated from the "Contact Organizer" form.
export const initialLeads: Lead[] = [
    {
      id: "lead-1",
      tripId: "1",
      tripTitle: "Himalayan Peak Trek",
      organizerId: "adventure-seekers",
      travelerId: "user-alice-johnson",
      travelerName: "Alice Johnson",
      travelerPhone: "+917777777771",
      message: "Hi, I was wondering what the guide-to-trekker ratio is for this trip. Also, are trekking poles provided?",
      date: new Date().toISOString(),
      status: 'new',
    },
    {
      id: "lead-2",
      tripId: "7",
      tripTitle: "Spiti Valley Winter Expedition",
      organizerId: "wanderlust-adventures",
      travelerId: "user-bob-williams",
      travelerName: "Bob Williams",
      travelerPhone: "+917777777772",
      message: "Is this trip suitable for a first-time winter trekker? I have done summer treks before but never in snow.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'new',
    },
     {
      id: "lead-3",
      tripId: "4",
      tripTitle: "Coorg Coffee Plantation Stay",
      organizerId: "adventure-seekers",
      travelerId: "user-charlie-brown",
      travelerName: "Charlie Brown",
      travelerPhone: "+919876543212",
      message: "Can I bring my pet dog along for this plantation stay?",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      status: 'unlocked',
    },
];

// --- LEAD PACKAGES ---
// This array holds the available lead credit packages for organizers to purchase.
export const initialLeadPackages: LeadPackage[] = [
    { id: "pkg-1", name: "Starter Pack", description: "Perfect for getting your first few leads.", credits: 10, price: 100, originalPrice: 120, popular: false },
    { id: "pkg-2", name: "Growth Pack", description: "Our most popular choice for growing your business.", credits: 50, price: 450, originalPrice: 600, popular: true },
    { id: "pkg-3", name: "Business Pack", description: "Best value for high-volume organizers.", credits: 100, price: 800, originalPrice: 1200, popular: false },
];


// --- STATIC & ADMIN-MANAGED TAGS ---
// This data will be managed by the admin in a real application.
export const initialTravelCities: string[] = [
    'Agra', 'Ahmedabad', 'Ajmer', 'Alappuzha (Alleppey)', 'Almora', 'Amritsar', 
    'Andaman and Nicobar Islands', 'Aurangabad', 'Bangalore', 
    'Bareilly', 'Belgaum', 'Bhopal', 'Bhubaneswar', 'Bhuj', 'Bikaner', 'Bir', 
    'Bodh Gaya', 'Chandigarh', 'Chamba', 'Chennai', 'Chikmagalur', 'Chittorgarh', 
    'Coimbatore', 'Coorg (Kodagu)', 'Cuttack', 'Dalhousie', 'Darjeeling', 'Dehradun', 
    'Delhi', 'Dharamshala', 'Digha', 'Diu', 'Ernakulam (Kochi)', 'Erode', 'Faridabad', 
    'Firozabad', 'Gangtok', 'Gaya', 'Ghaziabad', 'Goa', 'Gokarna', 'Gulmarg', 
    'Guntur', 'Guwahati', 'Gwalior', 'Hampi', 'Haridwar', 'Hyderabad', 'Imphal', 
    'Indore', 'Itanagar', 'Jaipur', 'Jaisalmer', 'Jalandhar', 'Jammu', 'Jamshedpur', 
    'Jhansi', 'Jodhpur', 'Kalimpong', 'Kanchipuram', 'Kanyakumari', 'Kanpur', 'Kargil', 
    'Kasauli', 'Kasol', 'Khajuraho', 'Kochi', 'Kodaikanal', 'Kohima', 'Kolkata', 
    'Kollam', 'Kota', 'Kovalam', 'Kozhikode', 'Kullu', 'Lakshadweep', 'Lansdowne', 
    'Leh', 'Lonavala', 'Lucknow', 'Ludhiana', 'Madurai', 'Mahabaleshwar', 'Mahabalipuram', 
    'Manali', 'Mangalore', 'Mathura', 'Mount Abu', 'Mumbai', 'Munnar', 'Mussoorie', 
    'Mysore', 'Nainital', 'Nagpur', 'Nashik', 'Noida', 'Ooty (Udhagamandalam)', 
    'Palakkad', 'Panaji', 'Patna', 'Pondicherry', 'Port Blair', 'Pune', 'Puri', 
    'Pushkar', 'Raipur', 'Rajahmundry', 'Rajkot', 'Rameswaram', 'Ramnagar', 'Ranchi', 
    'Rann of Kutch', 'Ratnagiri', 'Rishikesh', 'Salem', 'Shillong', 'Shimla', 
    'Sikkim', 'Siliguri', 'Solan', 'Spiti Valley', 'Srinagar', 'Surat', 'Thanjavur', 
    'Thiruvananthapuram', 'Tiruchirappalli', 'Tirupati', 'Udaipur', 'Ujjain', 
    'Vadodara', 'Varanasi', 'Vellore', 'Vijayawada', 'Visakhapatnam', 'Vrindavan', 
    'Warangal'
].sort();

export const initialTravelInterests: string[] = [
    'Adventure', 'Backpacking', 'Biking', 'Bouldering', 'Camping', 'Cultural', 'Food', 'Group Travel', 'Hiking', 'Kayaking', 'Paragliding', 'Photography', 'Rafting', 'Relaxation', 'Road Trips', 'Scuba Diving', 'Solo Travel', 'Spiritual', 'Treks', 'Weekend Getaways'
].sort();

export const initialTripCategories: string[] = [
    "Treks", "Road Trips", "Camping", "Weekend Getaways"
];

export const initialTripDifficulties: string[] = [
    "Easy", "Moderate", "Challenging", "Expert"
];

// New centralized FAQ data
export const initialFaqs: FAQ[] = [
    {
        id: "faq-1",
        question: "How does the booking process work?",
        answer: "It's simple! Find a trip you love, select a date from the available batches, and choose your payment option. You can either pay the full amount upfront or, for eligible trips, reserve your spot by paying a small percentage. You'll receive a confirmation email and the booking will appear in your 'My Adventures' dashboard."
    },
    {
        id: "faq-2",
        question: "What is a 'Verified Organizer'?",
        answer: "A Verified Organizer is a trip partner who has successfully completed our onboarding and verification process. This includes submitting necessary legal documents and proving their experience in organizing trips. Booking with a Verified Organizer provides an extra layer of trust and safety for your adventure."
    },
    {
        id: "faq-3",
        question: "How can I use my Wallet Balance?",
        answer: "On the booking page, right before you pay, you will see an option to 'Use Wallet Balance'. Simply toggle the switch on. The available balance will be applied to your booking amount, and you will only need to pay the remaining difference, if any."
    },
    {
        id: "faq-4",
        question: "How do referrals work?",
        answer: "In your dashboard, you'll find a unique referral code. Share this code with your friends. When they sign up and book their first trip using your code, both you and your friend receive a bonus amount credited directly to your Travonex wallets!"
    },
    {
        id: "faq-5",
        question: "What happens if I cancel my booking?",
        answer: "Each trip has its own cancellation policy set by the organizer, which you can find on the trip details page. The refund amount depends on how far in advance you cancel. Any refundable amount will be processed back to your original payment method or credited to your wallet."
    },
    {
        id: "faq-6",
        question: "How can I write a review or a story?",
        answer: "After a trip is completed, you can go to your 'My Adventures' page in the 'Completed' tab. You will find a 'Leave a Review' button on the booking card. To write a longer travel story for our blog, you can visit the 'My Stories' page and click 'Write a New Story'."
    },
    {
        id: "faq-7",
        question: "What is the AI Planner?",
        answer: "The AI Planner is a tool that helps you get personalized trip recommendations. Just describe what you're looking for in a trip—your interests, budget, and travel style—and our AI will suggest ideas and destinations tailored just for you."
    }
];


// --- ADMIN AUDIT LOGS ---
export const initialAuditLogs: AuditLog[] = [
    {
        id: 'log-1',
        timestamp: subDays(new Date(), 1).toISOString(),
        adminName: 'Admin User',
        action: 'Trip Approved',
        entityType: 'Trip',
        entityId: '7',
        entityName: 'Spiti Valley Winter Expedition',
    },
    {
        id: 'log-2',
        timestamp: subDays(new Date(), 2).toISOString(),
        adminName: 'Admin User',
        action: 'Organizer Approved',
        entityType: 'Organizer',
        entityId: 'wanderlust-adventures',
        entityName: 'Wanderlust Adventures',
    },
     {
        id: 'log-3',
        timestamp: subDays(new Date(), 3).toISOString(),
        adminName: 'Admin User',
        action: 'Trip Rejected',
        entityType: 'Trip',
        entityId: 'some-old-trip',
        entityName: 'Old Rejected Trip',
        details: 'Cover image quality is too low.'
    },
];



// --- MOCK METRICS FOR DASHBOARDS ---
// These are currently unused but demonstrate how dashboard data could be structured.

export const mockOrganizerMetrics = {
  total_bookings: 124,
  payout_pending: 15750,
  agency_status: 'Verified',
};

export const mockAdminMetrics = {
  system_status: 'All Systems Operational',
  pending_verifications: 2,
  new_trips_today: 14,
};

export const mockVerificationQueue = [
    { id: 'agency-01', name: 'Mountain Movers'},
    { id: 'agency-02', name: 'Coastal Explorers'},
];

// Add a mock invoice to the placeholder images
export const initialInvoices = {
    'mock-invoice.pdf': 'A placeholder for a PDF invoice file.'
};















