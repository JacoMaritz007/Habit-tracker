// Gemini proxy: keeps the API key on the server. The browser POSTs
// { contents, config } to /api/gemini (rewritten here by Firebase Hosting)
// with the signed-in user's Firebase ID token.
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

// Users sign in with Firebase Auth in this same project.
const authApp = initializeApp();

const MODEL = 'gemini-3-flash-preview';
const ALLOWED_CONFIG_KEYS = ['systemInstruction', 'responseMimeType'];

export const gemini = onRequest(
  {
    region: 'us-central1',
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 120,
    memory: '512MiB',
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const token = (req.get('Authorization') || '').replace(/^Bearer /, '');
    if (!token) {
      res.status(401).json({ error: 'Sign in required' });
      return;
    }
    let uid;
    try {
      ({ uid } = await getAuth(authApp).verifyIdToken(token));
    } catch {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    const { contents, config = {} } = req.body || {};
    if (!contents) {
      res.status(400).json({ error: 'Missing contents' });
      return;
    }
    const safeConfig = Object.fromEntries(
      Object.entries(config).filter(([key]) => ALLOWED_CONFIG_KEYS.includes(key))
    );

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const result = await ai.models.generateContent({ model: MODEL, contents, config: safeConfig });
      res.json({ text: result.text ?? '' });
    } catch (err) {
      logger.error('Gemini request failed', { uid, message: err?.message });
      res.status(502).json({ error: 'AI service unavailable' });
    }
  }
);
