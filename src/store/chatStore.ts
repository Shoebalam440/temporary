import { create } from 'zustand'
import { io, Socket } from "socket.io-client"
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  text: string
  username: string
  timestamp: Date | string
  file?: {
    name: string
    url: string
    type: string
    size: number
  }
}

interface ChatState {
  roomId: string | null
  username: string
  messages: Message[]
  isJoined: boolean
  isConnected: boolean
  socket: Socket | null
  
  initSocket: () => void
  closeSocket: () => void
  joinRoom: (roomId: string, username: string) => void
  createRoom: (username: string) => string
  addMessage: (message: Message) => void
  reset: () => void
  setUsername: (username: string) => void
}

const backendUrl = "https://temporary-sbhe.onrender.com";

const initialState = {
  roomId: null,
  username: '',
  messages: [],
  isJoined: false,
  isConnected: false,
  socket: null,
}

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  initSocket: () => {
    if (get().socket) return;

    const socket = io(backendUrl);

    socket.on("connect", () => {
      set({ isConnected: true, socket: socket });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false, socket: null });
    });

    socket.on("newMessage", (message: Message) => {
      get().addMessage(message);
    });

    socket.on("allMessages", (messages: Message[]) => {
      set({ messages: messages.map(m => ({...m, timestamp: new Date(m.timestamp)})) });
    });
  },

  closeSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false });
  },

  joinRoom: (roomId, username) => {
    get().socket?.emit('joinRoom', roomId);
    set({ roomId, username, isJoined: true, messages: [] });
  },
  
  createRoom: (username) => {
    const roomId = uuidv4().substring(0, 8);
    get().socket?.emit('joinRoom', roomId);
    set({ roomId, username, isJoined: true, messages: [] });
    return roomId;
  },
  
  addMessage: (message) => {
    set((state) => {
      if (state.messages.some(m => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, { ...message, timestamp: new Date(message.timestamp) }] };
    });
  },
  
  reset: () => {
    get().closeSocket();
    set(initialState);
  },

  setUsername: (username: string) => {
    set({ username });
  }
}))