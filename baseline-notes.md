# Baseline Notes Before Render Deployment

- Repo pushed to: https://github.com/shrutirai29/khety-deploy
- Current deployment source of truth: main branch on khety-deploy
- Current code includes backend, frontend, and separate ML service
- Frontend depends on backend API and ML API separately
- MongoDB is required
- Cloudinary is required for image upload
- Mail credentials are required for OTP/reset flows
- ML model file plant_disease_model.h5 is required for detection
- Backend is an Express app under `khety-backend`
- Frontend is a Create React App app under `khety-frontend`
- ML service is a Flask app under `khety-backend/khety-ml`
- Frontend routing will require a Render rewrite from `/*` to `/index.html`
- ML model file exists locally and is about 267 MB
- ML model file is not tracked in git, so Render will not receive it automatically from GitHub

## External Dependency Baseline

- MongoDB stores users, crops, products, and saved predictions
- Cloudinary is used by `/api/upload-image` for image storage
- Mail provider is used by OTP and forgot-password flows
- ML model file is required for `/predict`

## Known Deployment Risks

- If `MONGODB_URI` is missing, auth, crops, marketplace, and prediction history will fail
- If Cloudinary credentials are invalid, image upload will fail
- If mail credentials are missing, OTP/reset will fall back to server logs instead of real email delivery
- If the ML model file is missing on Render, disease prediction will fail

## ML model deployment strategy pending:
- plant_disease_model.h5 is present locally
- not tracked in git
- Render ML service will need separate model delivery strategy
