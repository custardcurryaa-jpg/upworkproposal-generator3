# Upwork Proposal Generator 🚀

A secure, AI-powered Upwork proposal generator built with Gemini 2.0. Generate personalized proposals, track outcomes, and get insights on what converts.

## 🔒 Security Features

✅ **No exposed API keys** — API key stored securely in `.env`  
✅ **Backend proxy** — All Gemini calls go through your server  
✅ **Rate limiting** — 30 requests per 15 minutes per IP  
✅ **Input validation** — Type checking and size limits  
✅ **CORS protection** — Only your frontend can access  
✅ **Safe error messages** — No sensitive data leaked  

## 📋 Features

- **Generate Proposals** — Paste a job post, get a custom proposal in seconds
- **Profile Management** — Save your info once, use forever
- **Outcome Tracking** — Log wins/losses to find patterns
- **AI Insights** — Get actionable feedback on your proposals
- **Local Storage** — All data stays in your browser

## 🛠️ Setup

### Prerequisites
- Node.js 14+
- Gemini API key ([get one here](https://ai.google.dev))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/custardcurryaa-jpg/upworkproposal-generator3.git
cd upworkproposal-generator3

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Add your API key
# Open .env and paste your GEMINI_API_KEY

# 5. Run the server
npm run dev

# 6. Open frontend
# Visit http://localhost:3000 in your browser
# The backend runs on http://localhost:3001
```

## 📦 Project Structure

```
.
├── server.js              # Express backend (API proxy)
├── index.html             # Frontend (no API key)
├── package.json           # Dependencies
├── .env.example           # Config template
├── .gitignore             # Prevents committing secrets
└── README.md              # This file
```

## 🔑 API Endpoints

### POST `/api/generate-proposal`
Generates a proposal based on job post and profile.

**Request:**
```json
{
  "jobPost": "We need a React expert...",
  "profile": {
    "name": "Ali",
    "years": "5",
    "stack": "React, Node.js, MongoDB",
    "link1": "https://project.com",
    "link2": ""
  }
}
```

**Response:**
```json
{
  "success": true,
  "proposal": "Greetings, You'll receive lots of AI-generated..."
}
```

### POST `/api/generate-insights`
Analyzes proposal outcomes to find patterns.

**Request:**
```json
{
  "outcomes": [
    {
      "title": "React Dashboard",
      "result": "won",
      "proposal": "...",
      "jobPost": "...",
      "date": "21/05/2026"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "insights": "Based on your data, here are the patterns..."
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard
# GEMINI_API_KEY = your_key_here
# FRONTEND_URL = https://your-vercel-domain.vercel.app
```

### Heroku

```bash
# 1. Create app
heroku create your-app-name

# 2. Set environment variables
heroku config:set GEMINI_API_KEY=your_key_here
heroku config:set FRONTEND_URL=https://your-app.herokuapp.com

# 3. Deploy
git push heroku main
```

## ⚙️ Configuration

Edit `.env` to customize:

```env
GEMINI_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000  # Change for production
PORT=3001                            # Backend port
NODE_ENV=development                 # 'production' for live
```

## 🐛 Troubleshooting

**"Failed to generate proposal"**
- Check your Gemini API key is valid
- Ensure backend is running (`npm run dev`)
- Check browser console for errors

**CORS errors**
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Restart the backend

**API rate limit hit**
- Wait 15 minutes before trying again
- Or deploy to multiple servers

## 📄 License

MIT — Use freely, modify, redistribute.

## 🤝 Support

Having issues? Check:
1. `.env` is configured correctly
2. Backend is running on port 3001
3. Frontend can reach `http://localhost:3001`
4. Gemini API key is active and has quota

---

**Made with ❤️ for Upwork freelancers**
