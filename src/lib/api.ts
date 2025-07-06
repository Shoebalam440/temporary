// Centralized API utility for backend communication
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function postChatMessage(payload: {
  username: string;
  text: string;
  roomId: string;
  fileUrl?: string;
}) {
  const res = await fetch(`${BACKEND_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
  return res.json();
} 