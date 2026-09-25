// Vercel serverless function: proxies Gemini generateContent calls.
//
// SECURITY: GEMINI_API_KEY lives ONLY here, server-side. It must never be
// inlined into the client bundle (the old vite.config.ts `define` block did
// exactly that — it has been removed).
//
// Usage (client):
//   POST /api/gemini
//   { "model": "gemini-3-flash-preview", "contents": "...", "config": { "tools": [...], "systemInstruction": "...", "imageConfig": { "aspectRatio": "..." } } }
// Responds with the raw Google generateContent JSON.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set in the server environment. Add it in the Vercel project settings under Environment Variables.',
    });
  }

  const { model, contents, config } = req.body || {};
  if (!model || contents === undefined) {
    return res.status(400).json({ error: 'Request body must include "model" and "contents".' });
  }

  // Normalize to the REST API shape (the old @google/genai SDK accepted
  // shortcuts like a plain-string `contents` that the REST API does not).
  const body = {
    contents:
      typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
  };
  if (config) {
    if (config.tools) body.tools = config.tools;
    if (config.systemInstruction !== undefined) {
      body.systemInstruction =
        typeof config.systemInstruction === 'string'
          ? { parts: [{ text: config.systemInstruction }] }
          : config.systemInstruction;
    }
    if (config.imageConfig) {
      body.generationConfig = {
        ...(body.generationConfig || {}),
        imageConfig: config.imageConfig,
      };
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  let upstream;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header form keeps the key out of URLs/logs (never use a ?key= query param).
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach the Gemini API.' });
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const message =
      data?.error?.message || `Gemini API request failed (HTTP ${upstream.status}).`;
    return res.status(upstream.status).json({ error: message });
  }
  return res.status(200).json(data);
}
