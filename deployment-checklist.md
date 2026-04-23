# Khety Deployment Checklist

## Auth
- [ ] Farmer signup works
- [ ] Owner signup works
- [ ] OTP send works
- [ ] OTP verify works
- [ ] Login works
- [ ] Forgot password works
- [ ] Reset password works
- [ ] OTP email is delivered to inbox, not just server logs
- [ ] Password reset email contains the correct frontend URL

## User
- [ ] Profile loads
- [ ] Profile update works
- [ ] Deactivate account works

## Farmer Flow
- [ ] Farmer dashboard loads
- [ ] Create crop listing works
- [ ] View own crop listings works

## Owner Flow
- [ ] Owner dashboard loads
- [ ] Owner marketplace loads
- [ ] Owner can send request
- [ ] Owner can send message
- [ ] Owner can update request status

## Marketplace
- [ ] Products load correctly

## Detection
- [ ] Image upload works
- [ ] Cloudinary upload returns a valid hosted image URL
- [ ] ML prediction works
- [ ] Prediction saves to DB
- [ ] Prediction history loads
- [ ] Single report page loads

## General UI
- [ ] Navbar navigation works
- [ ] Voice navigation opens
- [ ] Home page loads correctly
- [ ] Login page loads correctly
- [ ] Signup page loads correctly

## Routing
- [ ] Refresh on /login works
- [ ] Refresh on /signup works
- [ ] Refresh on /dashboard routes works
- [ ] Refresh on report/reset-password routes works
