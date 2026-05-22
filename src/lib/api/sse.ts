import { API_BASE_URL } from '@/src/constants/api';
import { getToken } from '@/src/lib/storage/secureStore';
import { SseChunk, ChatRequest } from '@/src/types/message';

/**
 * Stream chat via XMLHttpRequest.
 *
 * React Native's fetch does NOT expose response.body as a ReadableStream
 * (it's `undefined`). XHR's `onprogress` fires as each chunk arrives,
 * giving us real token-by-token streaming.
 */
async function attemptStream(
  url: string,
  token: string | null,
  request: ChatRequest,
  onChunk: (chunk: SseChunk) => void,
  signal: AbortSignal
): Promise<void> {

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      const e = new Error('Aborted'); e.name = 'AbortError';
      reject(e);
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    let processedLength = 0;
    let buffer = '';
    let settled = false;

    const settle = (fn: () => void) => {
      if (!settled) { settled = true; fn(); }
    };

    // Parse all complete SSE frames from buffer, return true if stream is done
    const processBuffer = (): boolean => {
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.substring(0, boundary).trim();
        buffer = buffer.substring(boundary + 2);

        if (!frame.startsWith('data: ')) continue;
        const payload = frame.substring(6).trim();

        console.log('[SSE] frame payload (first 120):', payload.substring(0, 120));

        if (payload === '[DONE]') {
          console.log('[SSE] received [DONE]');
          settle(resolve);
          return true;
        }
        if (payload.startsWith('[ERROR]')) {
          const msg = payload.substring(7).trim();
          console.log('[SSE] received [ERROR]:', msg);
          settle(() => reject(new Error(msg)));
          return true;
        }

        try {
          const chunk = JSON.parse(payload) as SseChunk;
          console.log('[SSE] chunk — content len:', chunk.content?.length ?? 0, '| has balance:', !!chunk.balance, '| has hitl:', !!chunk.hitl_data);
          onChunk(chunk);
        } catch (e) {
          console.log('[SSE] JSON.parse failed for payload:', payload.substring(0, 120), '| err:', e);
        }
      }
      return false;
    };

    xhr.onprogress = () => {
      const newData = xhr.responseText.slice(processedLength);
      if (!newData) return;
      processedLength = xhr.responseText.length;
      console.log('[SSE] onprogress — new bytes:', newData.length);
      buffer += newData;
      processBuffer();
    };

    xhr.onload = () => {
      console.log('[SSE] onload — status:', xhr.status, '| total bytes:', xhr.responseText.length);
      if (xhr.status >= 400) {
        settle(() => reject(new Error(`Stream error ${xhr.status}: ${xhr.responseText.substring(0, 200)}`)));
        return;
      }
      // Flush any data not caught by onprogress
      const remaining = xhr.responseText.slice(processedLength);
      if (remaining) {
        buffer += remaining;
        processBuffer();
      }
      settle(resolve);
    };

    xhr.onerror = () => {
      console.log('[SSE] onerror — network failure');
      settle(() => reject(new Error('NetworkError')));
    };

    signal.addEventListener('abort', () => {
      console.log('[SSE] abort signal — cancelling XHR');
      xhr.abort();
      const e = new Error('Aborted'); e.name = 'AbortError';
      settle(() => reject(e));
    });

    xhr.send(JSON.stringify(request));
  });
}

export async function streamChat(
  request: ChatRequest,
  onChunk: (chunk: SseChunk) => void,
  signal: AbortSignal
): Promise<void> {
  const token = await getToken();
  const url = `${API_BASE_URL}/messages/stream`;

  console.log('[SSE] → XHR POST', url);
  console.log('[SSE] request body:', JSON.stringify(request));

  try {
    await attemptStream(url, token, request, onChunk, signal);
  } catch (err) {
    if (signal.aborted) throw err;
    // Network-level failure (e.g. radio not ready on cold start) — retry once
    if (err instanceof Error && err.message === 'NetworkError') {
      console.log('[SSE] network error — retrying in 1.5s');
      await new Promise(r => setTimeout(r, 1500));
      if (signal.aborted) { const e = new Error('Aborted'); e.name = 'AbortError'; throw e; }
      console.log('[SSE] retrying...');
      await attemptStream(url, token, request, onChunk, signal);
    } else {
      throw err;
    }
  }
}
