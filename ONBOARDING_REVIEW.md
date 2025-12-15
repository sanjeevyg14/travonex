# Onboarding Flow Review - Issues Identified & Fixes

## Issues Found

### 1. Organizer Application Form ❌
**File:** `src/app/dashboard/organizer-application/page.tsx`

**Issues:**
- ❌ Uses `organizerService.submitApplication()` (client SDK) instead of API
- ❌ Missing bank account details fields (bankAccountName, bankAccountNumber, bankIfscCode)
- ✅ Form structure is good, has proper file handling

**Fix Required:**
- Update to call `POST /api/organizers/[organizerId]/application`
- Add bank account details fields to form

### 2. Experience Vendor Application Form ❌
**File:** `src/app/dashboard/experience-vendor-application/page.tsx`

**Issues:**
- ❌ Uses mock data (`useMockData`, `setOrganizers`, `addAuditLog`) - no backend integration
- ❌ Missing bank account details fields
- ❌ No API call at all
- ✅ Form structure is good, has proper file handling

**Fix Required:**
- Update to call `POST /api/organizers/[organizerId]/application` with `partnerType: 'experience'`
- Add bank account details fields to form

### 3. API Endpoint ✅
**File:** `src/app/api/organizers/[organizerId]/application/route.ts`

**Status:** ✅ Correctly handles both trip and experience applications
**Notes:** 
- Properly extracts bank account details
- Handles file uploads correctly
- Supports both partner types

## Required Fixes

### Priority 1: Update Forms to Use API
Both forms need to:
1. Create FormData with all fields including files
2. Call the API endpoint with multipart/form-data
3. Handle response and redirect appropriately

### Priority 2: Add Bank Account Details
Both forms need to add:
- Bank Account Name
- Bank Account Number
- Bank IFSC Code

### Priority 3: Error Handling
- Add proper error messages
- Show validation errors
- Handle file upload errors

## Onboarding Flow Summary

### Organizer Application Flow
1. User visits `/dashboard/organizer-application` or `/partner-with-us`
2. Fills form with:
   - Business/Individual type
   - Company name
   - Contact details
   - Experience description
   - KYC documents (varies by type)
   - Bank account details
3. Submits form → API creates organizer with status "pending"
4. User document updated with `organizerId` and `organizerStatus: "pending"`
5. Admin reviews application
6. Admin approves/rejects → status changes to "approved"/"rejected"
7. User can access organizer dashboard when approved

### Experience Vendor Application Flow
1. User visits `/dashboard/experience-vendor-application` or `/partner-with-us`
2. Fills form with:
   - Business/Individual type
   - Company name
   - Contact details
   - Experience description
   - Business documents
   - Safety & compliance documents
   - Bank account details
3. Submits form → API creates organizer with `partnerType: "experience"` and status "pending"
4. User document updated with `organizerId` and `organizerStatus: "pending"`
5. Admin reviews application
6. Admin approves/rejects → status changes to "approved"/"rejected"
7. User can access vendor dashboard when approved

## Missing API Endpoints

None - the existing endpoint handles both cases.

## Next Steps

1. ✅ Update organizer application form to use API
2. ✅ Update experience vendor application form to use API
3. ✅ Add bank account details to both forms
4. ⚠️ Consider adding application status check endpoint
5. ⚠️ Consider adding ability to view submitted application

