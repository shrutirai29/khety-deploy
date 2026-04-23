# Render Environment Notes

## Backend Service
- MONGODB_URI
- AUTH_SECRET
- APP_URL
- CORS_ORIGIN
- MAIL_SERVICE
- MAIL_USER
- MAIL_PASS
- MAIL_FROM
- MERCHANT_NAME
- MERCHANT_UPI_ID
- PAYMENT_GATEWAY_SECRET

### Backend env usage
- `MONGODB_URI`: MongoDB connection for users, crops, products, predictions
- `AUTH_SECRET`: token signing secret for login sessions
- `APP_URL`: used to build password reset links
- `CORS_ORIGIN`: allowed frontend origin for browser requests
- `MAIL_SERVICE`: mail provider name, defaults to `gmail` in code
- `MAIL_USER`: sender login for OTP/reset mail
- `MAIL_PASS`: app password or provider password
- `MAIL_FROM`: visible sender email and required for real mail sending
- `MERCHANT_NAME`: payment/merchant display config
- `MERCHANT_UPI_ID`: payment identifier config
- `PAYMENT_GATEWAY_SECRET`: reserved payment secret config
- `PORT`: optional on backend because code already reads `process.env.PORT || 5000`

## Frontend Static Site
- REACT_APP_API_URL
- REACT_APP_ML_API_URL

### Frontend env usage
- `REACT_APP_API_URL`: public URL of the Node backend
- `REACT_APP_ML_API_URL`: public URL of the Flask ML service

## ML Service
- PORT=5001

### ML service notes
- Current code starts Flask on port `5001`
- `plant_disease_model.h5` must exist in the ML service root at runtime
- The model file is not tracked in git, so a separate delivery strategy is required before deployment

## External Services Required
- MongoDB
- Cloudinary
- Mail provider
- ML model file

## Dependency Notes

### Cloudinary
- Current code uses `khety-backend/config/cloudinary.js`
- Cloudinary credentials are currently hardcoded in source code
- Before production rollout, these credentials should be rotated and moved to environment variables

### Mail
- Real email sending only happens when `MAIL_USER`, `MAIL_PASS`, and `MAIL_FROM` are present
- Without these values, OTP and reset links are only logged on the backend server

### MongoDB
- Required before backend deployment is useful
- Can be provided by MongoDB Atlas or a Render-hosted MongoDB service

### ML Model
- Local file confirmed: `khety-backend/khety-ml/plant_disease_model.h5`
- Not tracked in git
- Needs a deployment plan before ML service creation
