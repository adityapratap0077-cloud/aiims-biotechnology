// Client-side helper that routes ALL Gemini calls through the server-side
// proxy at /api/gemini. GEMINI_API_KEY lives only on the server — it must
// never appear in this file or any other client file.

interface GenerateContentOptions {
  model: string;
  contents: any;
  config?: {
    tools?: any;
    systemInstruction?: string | any;
    imageConfig?: any;
  };
}

interface ContentPart {
  text?: string;
  inlineData?: { data: string; mimeType: string };
}

export interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: ContentPart[] };
    groundingMetadata?: {
      groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
    };
  }>;
  /** Concatenated text of all text parts, mirroring the SDK's response.text. */
  text?: string;
}

export async function generateContent(
  opts: GenerateContentOptions
): Promise<GeminiGenerateResponse> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.error || `Gemini request failed (HTTP ${res.status}).`
    );
  }

  const text =
    (data.candidates || [])
      .flatMap((c: any) => c?.content?.parts || [])
      .map((p: any) => p?.text || '')
      .join('') || undefined;

  return { ...data, text };
}
