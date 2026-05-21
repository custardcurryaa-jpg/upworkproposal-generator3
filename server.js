const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY not set in .env file');
  process.exit(1);
}

// ── Middleware ──
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['POST', 'OPTIONS'],
  credentials: true
}));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Generate Proposal ──
app.post('/api/generate-proposal', async (req, res) => {
  try {
    const { jobPost, profile } = req.body;

    // Validate inputs
    if (!jobPost || typeof jobPost !== 'string') {
      return res.status(400).json({ error: 'Invalid job post' });
    }
    if (jobPost.length > 50000) {
      return res.status(400).json({ error: 'Job post too long (max 50000 chars)' });
    }
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'Invalid profile' });
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(profile);

    // Call Gemini API
    const proposal = await callGemini(systemPrompt, jobPost);

    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Generate Proposal Error:', error);
    res.status(500).json({ error: 'Failed to generate proposal. Please try again.' });
  }
});

// ── Generate Insights ──
app.post('/api/generate-insights', async (req, res) => {
  try {
    const { outcomes } = req.body;

    if (!Array.isArray(outcomes) || outcomes.length < 3) {
      return res.status(400).json({ error: 'At least 3 outcomes required' });
    }

    const won = outcomes.filter(o => o.result === 'won');
    const lost = outcomes.filter(o => o.result === 'lost');

    const prompt = `Analyze these Upwork proposal outcomes. Give 3–5 specific, actionable insights about what patterns drive responses vs silence.

WON (${won.length}):
${won.map(o => `Job: ${o.title}\nProposal: ${o.proposal}`).join('\n---\n')}

LOST (${lost.length}):
${lost.map(o => `Job: ${o.title}\nProposal: ${o.proposal}`).join('\n---\n')}

Be direct, specific, and honest. Bullet points. Focus on what to change.`;

    const insights = await callGemini(
      'You are an Upwork expert analyzing proposal performance. Be direct, specific, and brutally honest.',
      prompt
    );

    res.json({ success: true, insights });
  } catch (error) {
    console.error('Generate Insights Error:', error);
    res.status(500).json({ error: 'Failed to generate insights. Please try again.' });
  }
});

// ── Helper: Build System Prompt ──
function buildSystemPrompt(p) {
  return `You are an Upwork proposal writer. Write proposals in this exact style:

FIXED LINES — NEVER CHANGE:
- Opening: "Greetings,"
- Hook line 2: "You'll receive lots of AI-generated responses, so I'll be direct."
- Closing: "You've read this far, so you may message me to discuss further.\nSee you inside :)\nThanks"

VOICE: Simple plain English. No buzzwords. Client-first — use "you/your" more than "I". Confident, direct, human. Under 150 words total.

STRUCTURE (adapt based on job):
- BLOCK A (conditional): "You just have to share [thing1] + [thing2] + [thing3]." — ONLY if job is vague and you need info. SKIP if job has full details.
- BLOCK B (approach): If complex job → "Approach will be: Step 1 → Step 2 → Step 3". If simple → one inline sentence "The approach will be to [...]". If client asked numbered questions → answer them numbered.
- BLOCK C (proof): Always include a live link with 1-line description in brackets.
- BLOCK D (experience): "Moreover, I have got ${p.years}+ years of experience with [EXACT STACK FROM JOB POST] & other full-stack technologies." Mirror exact version numbers from job post.
- BLOCK E (portfolio, frontend/UI jobs only): "You may take a look at my recent [type] projects:"

PROFILE:
- Stack: ${p.stack}
- Portfolio: ${p.link1}${p.link2 ? '\n- ' + p.link2 : ''}

PATTERNS:
- Use "obviously" when client worries about something (availability, skill match)
- Mirror client's exact stack versions from job post
- Keep it under 150 words
- Never sound like AI

Output ONLY the proposal text. No explanation, no preamble.`;
}

// ── Helper: Call Gemini API ──
async function callGemini(systemPrompt, userMessage) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt + '\n\nJob Post:\n' + userMessage
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from API';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔒 CORS enabled for: ${FRONTEND_URL}`);
  console.log(`⚠️  Make sure GEMINI_API_KEY is set in .env`);
});
