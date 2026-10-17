import { auth } from '../firebase';

// Calls Gemini through the /api/gemini Cloud Function so the API key never
// reaches the browser. Mirrors the slice of the @google/genai API the app
// uses: ai.models.generateContent({ model, contents, config }) → { text }.
// The model is chosen server-side; `model` is accepted only for call-site parity.

type GenerateRequest = {
  model?: string;
  contents: unknown;
  config?: { systemInstruction?: string; responseMimeType?: string };
};

async function generateContent({ contents, config }: GenerateRequest): Promise<{ text: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to use the AI coach.');
  const token = await user.getIdToken();

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ contents, config }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `AI request failed (${res.status})`);
  return { text: body.text ?? '' };
}

export const ai = { models: { generateContent } };
