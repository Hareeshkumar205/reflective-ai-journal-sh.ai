# Reflective AI Journal

A user-authenticated, reflective journaling and brainstorming web application powered by **Gemini 3.6 Flash** and **Google Cloud Firestore**, engineered with zero-trust user data isolation and Google Secret Manager hygiene.

---

## Architecture & Security Highlights

1. **User Identity Isolation**: Authenticated via Firebase Authentication (Google Sign-In). No passwords or emails are stored in custom application database tables.
2. **Owner-Bound Document Access**: All interactions, prompts, and reflections are saved under `/users/{userId}/interactions/{interactionId}`. Cloud Firestore Security Rules enforce that users can only read, write, or query their own documents (`request.auth.uid == userId`).
3. **Zero Client Secret Leakage**: The `GEMINI_API_KEY` is strictly managed server-side in `server.ts` through environment variables / Google Cloud Secret Manager. The key is never exposed to browser bundles.
4. **Resilient AI Fallback Ladder**: The inference layer uses an automated fallback chain (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`) with error status code handling.
5. **Zero-Crash Payload Hygiene**: All client and server database writes strip `undefined` properties before passing objects to Firestore SDK drivers.

---

## 1. Cloud Firestore Security Rules

Deploy the following rules to enforce strict per-user boundary isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Root level closed by default
    match /{document=**} {
      allow read, write: if false;
    }

    // User-isolated collection path
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 2. Environment & Prerequisites

### Enable Required Google Cloud APIs

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  generativelanguage.googleapis.com
```

### Provision Cloud Firestore

```bash
# Provision Cloud Firestore in Native Mode
gcloud firestore databases create --location=us-central1 --type=firestore-native
```

---

## 3. Secret Management Setup

Store your Gemini API key securely in Google Cloud Secret Manager and grant Cloud Run runtime permissions:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Local Development

Install dependencies and start the full-stack server:

```bash
# Install dependencies
npm install

# Start Express + Vite dev server on port 3000
npm run dev
```

---

## 5. Google Cloud Run Deployment

Build and deploy directly to Cloud Run:

```bash
# Deploy to Cloud Run mounting the Secret Manager secret
gcloud run deploy reflective-ai-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 6. Required Campaign Labeling (Verification Binding)

To register the service for automated challenge verification, apply the mandatory campaign label:

```bash
gcloud run services update <SERVICE_NAME> \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=<REGION>
```
