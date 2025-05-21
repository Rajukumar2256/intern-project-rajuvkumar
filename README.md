# Todo Summary Assistant

A full-stack application to manage personal to-dos, summarize them using a real LLM (e.g., Gemini, OpenAI, Cohere, etc.), and send the summary to a Slack channel.

---

## Features

- **Add, edit, and delete** to-do items
- **View** a list of current to-dos
- **Summarize** all pending to-dos using a real LLM API (Gemini, OpenAI, Cohere, etc.)
- **Send summary to Slack** with a single click
- **Success/failure** feedback for Slack operation

---

## Architecture & Design Decisions

- **Frontend:** React (Vite) for a fast, modern UI.
- **Backend:** Node.js (Express) for API; Prisma ORM for PostgreSQL access.
- **Database:** PostgreSQL (hosted on Supabase or similar free-tier).
- **LLM Integration:** Pluggable support for Gemini, OpenAI, or Cohere via REST APIs.
- **Slack Integration:** Slack Incoming Webhooks for easy, secure summary posting.
- **Hosting:** Supabase for DB; Vercel/Netlify/Firebase for frontend hosting (optional).

---

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL database (Supabase recommended for easy setup)
- Slack workspace (for webhook integration)
- API key for your chosen LLM (Gemini, OpenAI, Cohere, etc.)

---

### 3. Environment Variables

Copy `.env.example` to `.env` in both `server` and `client` as needed, and fill in your actual keys/URLs.

---

### 4. Backend Setup (`server`)

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm start
```

- The backend will run on `http://localhost:3000` by default.

---

### 5. Frontend Setup (`client`)

```bash
cd client
npm install
npm run dev
```

- The frontend will run on `http://localhost:5173` by default.

---

## LLM Integration Guide

1. **Gemini (Google)**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Set `GEMINI_API_KEY` in your `.env`.
   - The backend uses the endpoint:  
     `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY`

2. **OpenAI**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/).
   - Set `OPENAI_API_KEY` in your `.env`.
   - The backend uses the `openai` npm package.

3. **Cohere**
   - Get your API key from [Cohere](https://dashboard.cohere.com/api-keys).
   - Set `COHERE_API_KEY` in your `.env`.
   - The backend uses the `cohere-ai` npm package.

> **Note:** Only one LLM provider is needed. Use whichever you have access to and set the relevant key in `.env`.

---

## Slack Integration Guide

1. Go to your Slack workspace and [create an Incoming Webhook](https://api.slack.com/messaging/webhooks).
2. Select the channel where summaries should be posted.
3. Copy the generated webhook URL.
4. Set `SLACK_WEBHOOK_URL` in your `.env`.

---

## Troubleshooting

- **CORS errors:** Ensure the backend `CORS` configuration allows your frontend’s URL.
- **LLM quota/rate limit:** If you see quota errors, wait for reset, upgrade your plan, or switch to a different LLM provider.
- **Slack errors:** Double-check your webhook URL and Slack channel permissions.
- **Prisma errors:** Ensure your `DATABASE_URL` is correct and the database is reachable.

---

## .env.example

Place this file in the root, and copy relevant variables into `server/.env` and `client/.env` as needed.

```env
# .env.example

# ==== Backend (server/.env) ====
DATABASE_URL=postgresql://user:password@host:port/dbname

# For Gemini LLM (Google)
GEMINI_API_KEY=your_gemini_api_key_here

# For OpenAI (if using OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# For Cohere (if using Cohere)
COHERE_API_KEY=your_cohere_api_key_here

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# ==== Frontend (client/.env) ====
VITE_API_URL=http://localhost:3000
```
