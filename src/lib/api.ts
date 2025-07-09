// Centralized API utility for backend communication
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function postChatMessage(payload: {
  username: string;
  text: string;
  roomId: string;
  file?: File;
  fileUrl?: string;
}) {
  let body: any;
  let headers: any = {};
  if (payload.file) {
    body = new FormData();
    body.append('username', payload.username);
    body.append('text', payload.text);
    body.append('roomId', payload.roomId);
    body.append('file', payload.file);
    if (payload.fileUrl) body.append('fileUrl', payload.fileUrl);
    // Do not set Content-Type header for FormData
  } else {
    body = JSON.stringify({
      username: payload.username,
      text: payload.text,
      roomId: payload.roomId,
      fileUrl: payload.fileUrl,
    });
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BACKEND_URL}/upload`, {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
  return res.json();
} 