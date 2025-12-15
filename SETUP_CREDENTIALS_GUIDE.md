# Firebase & Razorpay Credentials Setup Guide

## Quick Setup Checklist

Before testing, you need to set up credentials in your `.env.local` file (create it from `env.example`).

## 1. Firebase Credentials

### Where to Get Firebase Credentials:

#### Client-side Credentials (NEXT_PUBLIC_*)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) → **General** tab
4. Scroll to **Your apps** section
5. Click on your web app (or create one if you don't have it)
6. You'll see:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Admin Credentials (Server-side)
1. In Firebase Console → **Project Settings** → **Service Accounts** tab
2. Click **Generate New Private Key**
3. Download the JSON file
4. From the JSON file, extract:
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`
     - **Note**: Can be used as-is OR base64 encoded
     - The code handles both formats automatically
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`

**Important**: 
- The private key needs to keep newlines intact
- If using `.env.local`, you can either:
  - Use base64 encoding (safer for some hosting platforms)
  - Use escaped newlines: `"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"`
  - Use actual newlines if your env file supports multiline values

### Enable Firebase Services:

1. **Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Phone** provider
   - Configure reCAPTCHA (required for phone auth)

2. **Firestore Database**:
   - Go to **Firestore Database**
   - Create database (start in test mode for now)
   - Later, deploy security rules from `firestore.rules`

3. **Storage**:
   - Go to **Storage**
   - Get Started (if not already enabled)
   - Note the bucket name (goes in `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`)

## 2. Razorpay Credentials

### Where to Get Razorpay Credentials:

1. Sign up/Login at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. You'll see:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`
4. For **Webhook Secret**:
   - Go to **Settings** → **Webhooks**
   - Create a webhook endpoint: `https://yourdomain.com/api/webhooks/razorpay`
   - Subscribe to events: `payment.captured`, `payment.failed`, `payment.authorized`
   - Copy the **Webhook Secret** → `RAZORPAY_WEBHOOK_SECRET`

**For Testing**:
- Use **Test Mode** keys (toggle in Razorpay dashboard)
- Test card: `4111 1111 1111 1111` (any future expiry, any CVV)
- Test failure card: `4000 0000 0000 0002`

## 3. Environment File Setup

1. **Copy the example file**:
   ```bash
   cp env.example .env.local
   ```

2. **Fill in all values** in `.env.local`:
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

   # Firebase Admin Configuration
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
   # OR use base64 encoded:
   # FIREBASE_ADMIN_PRIVATE_KEY=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

   # Razorpay Configuration
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

   # Email Service (Optional - for notifications)
   BREVO_API_KEY=xxxxxxxxxxxxx
   ```

3. **Important Notes**:
   - `.env.local` is gitignored (never commit credentials!)
   - Restart your dev server after adding env variables
   - For production, set these in your hosting platform's environment variables

## 4. Verify Setup

After setting up credentials, verify they're working:

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Check console**:
   - Should NOT see: "Firebase Admin missing credentials, skipping init."
   - Should see Firebase initialized successfully

3. **Test Authentication**:
   - Try logging in with phone number
   - Check Firebase Console → Authentication for new users

4. **Test Firestore**:
   - Try creating a trip or booking
   - Check Firebase Console → Firestore for new documents

## 5. Common Issues

### Private Key Issues:
- **Problem**: "Invalid key format"
- **Solution**: Make sure newlines are preserved or use base64 encoding

### Authentication Not Working:
- **Problem**: Phone auth fails
- **Solution**: Make sure Phone provider is enabled in Firebase Console

### Storage Upload Fails:
- **Problem**: Cannot upload files
- **Solution**: Check Storage bucket name and rules

### Razorpay Payments Fail:
- **Problem**: Payment doesn't go through
- **Solution**: 
  - Use test mode keys for development
  - Check webhook URL is accessible
  - Verify webhook secret matches

## 6. Security Best Practices

✅ **DO**:
- Keep `.env.local` in `.gitignore` (already done)
- Use environment variables in production hosting
- Use test keys for development
- Rotate keys periodically

❌ **DON'T**:
- Commit credentials to git
- Share credentials publicly
- Use production keys in development
- Hardcode credentials in code

## Next Steps

Once credentials are set up:
1. Test authentication flow
2. Test trip creation
3. Test booking flow
4. Test payment integration
5. Deploy Firestore security rules
6. Set up webhook endpoint

For detailed setup instructions, see `docs/BACKEND_SETUP.md`


