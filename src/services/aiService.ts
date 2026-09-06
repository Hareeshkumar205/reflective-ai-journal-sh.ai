import { getCurrentUserToken } from '../firebase';
import { GeminiReflectRequest, GeminiReflectResponse } from '../types';

/**
 * Calls the secure backend proxy endpoint for Gemini reflection/brainstorming.
 * Ensures the API key is never exposed to the client.
 */
export async function requestGeminiReflection(
  params: GeminiReflectRequest
): Promise<GeminiReflectResponse> {
  const token = await getCurrentUserToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/gemini/reflect', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: params.prompt,
      mode: params.mode || 'reflect',
      history: params.history || [],
      title: params.title || '',
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to generate reflection response.';
    try {
      const errData = await response.json();
      if (errData?.error) {
        errorMsg = errData.error;
      }
    } catch {
      // ignore json parse error on non-ok status
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}
