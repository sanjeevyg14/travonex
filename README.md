# Travonex - Travel Marketplace Platform

A comprehensive travel marketplace platform where travelers can discover and book trips, organizers can list and manage trips, and vendors can offer experiences. Built with Next.js, Firebase, and Razorpay for payments.

## 🚀 Features

### For Travelers
- 📱 **Phone-based Authentication** - Secure login with OTP verification
- 🔍 **Trip Discovery** - Browse trips by category, location, difficulty, and price
- 🎯 **AI Planner** - Get personalized trip recommendations
- 💳 **Flexible Booking** - Full payment or spot reservation options
- ⭐ **Reviews & Ratings** - Share experiences and read reviews
- 💰 **Wallet System** - Manage credits and referral bonuses
- 👑 **Pro Subscription** - Get exclusive discounts and benefits
- 📝 **Travel Stories** - Share your adventures on the blog

### For Organizers
- 🏢 **Complete Dashboard** - Manage trips, bookings, and analytics
- 📊 **Analytics & Reports** - Track revenue, bookings, and performance
- 💵 **Settlement System** - Automated payout calculations
- 🎫 **Lead Management** - Purchase and unlock traveler leads
- 🎟️ **Coupon Management** - Create and manage promotional codes
- 💰 **Refund Management** - Handle refund requests from travelers

### For Experience Vendors
- 🎨 **Experience Management** - List single-day activities and tours
- 📅 **Booking Management** - Track experience bookings
- 💰 **Payout System** - View earnings and settlements
- 🔄 **Refund Handling** - Process experience booking refunds

### For Admins
- 👨‍💼 **Admin Panel** - Comprehensive management dashboard
- ✅ **Approval System** - Approve/reject trips and experiences
- 📈 **Platform Analytics** - Monitor platform-wide metrics
- 💼 **Organizer Management** - Manage organizer applications and status
- 💰 **Settlement Processing** - Process payouts to organizers/vendors
- 📋 **Audit Logs** - Track all admin actions
- ⚙️ **Platform Settings** - Configure commission rates, referral bonuses, etc.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firestore
- **Authentication**: Firebase Authentication (Phone OTP)
- **Storage**: Firebase Storage
- **Payments**: Razorpay
- **UI Components**: Radix UI, shadcn/ui

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled
- Razorpay account (test mode for development)
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Travonex -7th Dec- comp/Travonex -7th Dec"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp env.example .env.local
```

Fill in your credentials in `.env.local`:

#### Firebase Configuration

**Client-side (NEXT_PUBLIC_*)**:
- Get from Firebase Console → Project Settings → General → Your apps
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Server-side (Admin SDK)**:
- Get from Firebase Console → Project Settings → Service Accounts
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (can be base64 encoded or with newlines)

#### Razorpay Configuration

- Get from Razorpay Dashboard → Settings → API Keys
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` (from Webhooks settings)

For detailed setup instructions, see [`SETUP_CREDENTIALS_GUIDE.md`](./SETUP_CREDENTIALS_GUIDE.md).

### 4. Enable Firebase Services

1. **Authentication**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable **Phone** provider
   - Configure reCAPTCHA

2. **Firestore Database**:
   - Go to Firebase Console → Firestore Database
   - Create database (start in test mode)
   - Deploy security rules from `firestore.rules`

3. **Storage**:
   - Go to Firebase Console → Storage
   - Get Started
   - Configure storage rules

### 5. Seed Database (Optional but Recommended)

Populate Firestore with mock data for testing:

```bash
npm run seed
```

This will seed all collections with sample data. See [`SEED_DATA_GUIDE.md`](./SEED_DATA_GUIDE.md) for details.

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes (backend)
│   │   ├── dashboard/         # User dashboard
│   │   ├── organizer/         # Organizer dashboard
│   │   ├── vendor/            # Vendor dashboard
│   │   ├── management/        # Admin panel
│   │   ├── book/              # Trip booking pages
│   │   ├── experiences/       # Experience pages
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and types
│   │   ├── firebase/          # Firebase configuration
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── data.ts            # Mock data (for seeding)
│   ├── scripts/               # Utility scripts
│   │   └── seed-complete.ts   # Database seeding script
│   └── services/              # Service layer
├── public/                    # Static assets
├── docs/                      # Documentation
├── firestore.rules            # Firestore security rules
└── package.json
```

## 🗄️ Database Schema

### Main Collections

- **users** - User accounts (travelers, organizers, admins)
- **organizers** - Organizer/vendor profiles
- **trips** - Trip listings
- **experiences** - Experience listings
- **bookings** - Trip bookings
- **experience_bookings** - Experience bookings
- **reviews** - Reviews and ratings
- **coupons** - Promotional coupons
- **wallet_transactions** - Wallet transaction history
- **referrals** - Referral records
- **leads** - Traveler leads
- **lead_packages** - Lead credit packages
- **blog_stories** - Blog posts
- **faqs** - Platform FAQs
- **audit_logs** - Admin action logs
- **settings** - Platform-wide settings

For detailed API documentation, see [`COMPLETE_API_REFERENCE.md`](./COMPLETE_API_REFERENCE.md).

## 🧪 Testing

### Quick Start Testing

Follow the quick start guide to test critical paths:

```bash
# See QUICK_START_TESTING.md for detailed steps
```

### Comprehensive Testing

For full testing coverage, see:
- [`QUICK_START_TESTING.md`](./QUICK_START_TESTING.md) - Quick validation guide
- [`COMPREHENSIVE_TESTING_CHECKLIST.md`](./COMPREHENSIVE_TESTING_CHECKLIST.md) - Complete test cases
- [`TEST_EXECUTION_LOG.md`](./TEST_EXECUTION_LOG.md) - Test tracking template

## 📚 Documentation

- [`BACKEND_IMPLEMENTATION_SUMMARY.md`](./BACKEND_IMPLEMENTATION_SUMMARY.md) - Backend overview
- [`COMPLETE_API_REFERENCE.md`](./COMPLETE_API_REFERENCE.md) - API documentation
- [`SETUP_CREDENTIALS_GUIDE.md`](./SETUP_CREDENTIALS_GUIDE.md) - Credential setup
- [`SEED_DATA_GUIDE.md`](./SEED_DATA_GUIDE.md) - Database seeding guide
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Testing guide

## 🔐 Authentication Flow

1. User enters phone number
2. Firebase sends OTP
3. User verifies OTP
4. Backend creates/updates user in Firestore
5. Session cookie is set
6. User is authenticated for subsequent requests

## 💳 Payment Integration

- **Payment Gateway**: Razorpay
- **Payment Types**: Full payment, Partial payment (spot reservation)
- **Webhooks**: Payment status updates processed via webhooks
- **Refunds**: Handled through Razorpay refund API

## 🔄 Key Workflows

### Trip Booking Flow
1. Traveler browses trips
2. Selects trip and batch
3. Creates booking (reserved status)
4. Completes payment via Razorpay
5. Webhook confirms payment
6. Booking status updated to "Confirmed"
7. Trip batch slots decremented

### Organizer Onboarding
1. Organizer submits application with documents
2. Admin reviews application
3. Admin approves and creates organizer profile
4. Organizer can create trips
5. Admin approves trips
6. Trips go live

### Settlement Process
1. Bookings are grouped by trip batch
2. After trip completion, settlement batch created
3. Commission calculated and deducted
4. Net earnings available for payout
5. Admin processes payout
6. UTR number recorded

## 🚀 Deployment

### Environment Variables

Set all environment variables in your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Other platforms**: Configure according to their documentation

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

[Specify your license here]

## 👥 Team

[Add team members or contact information]

## 🐛 Known Issues

- [List any known issues or limitations]

## 🔮 Future Enhancements

- [List planned features or improvements]

## 📞 Support

For support, email [your-email] or open an issue in the repository.

---

**Built with ❤️ using Next.js and Firebase**
