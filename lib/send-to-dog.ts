// Browser-side: text your dog and receive the reply as it's written.
// /api/chat streams the reply as plain text.

/**
 * Sends `message` to the dog. `onText` gets the reply so far, each time more
 * arrives. Resolves with the full reply; throws an Error fit to show on failure.
 */
export async function sendToDog(
  dogId: string,
  message: string,
  onText: (soFar: string) => void,
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dogId, message }),
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Your dog couldn't reply just now. Try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let reply = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    reply += decoder.decode(value, { stream: true });
    onText(reply);
  }
  return reply.trim();
}
