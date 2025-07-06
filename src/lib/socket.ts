import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function createSocket(): Socket {
  return io(BACKEND_URL, {
    withCredentials: true,
  });
} 