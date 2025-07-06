import { create } from 'zustand'
import { Socket } from "socket.io-client"
import { createSocket } from '../lib/socket'

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
  socket: Socket | null
  
  initSocket: () => void
  closeSocket: () => void
  joinRoom: (roomId: string, username: string) => void
  createRoom: (username: string) => string
  addMessage: (message: Message) => void
  reset: () => void
  setUsername: (username: string) => void
}

const initialState = {
  roomId: null,
  username: '',
  messages: [],
  isJoined: false,
  socket: null,
};

export const useChatStore = create<ChatState>((set, get) => ({
    ...initialState,

  initSocket: () => {
    if (get().socket) return;
    const socket = createSocket();
    set({ socket });

    socket.on("newMessage", (message) => {
      set((state) => ({ 
        messages: [...state.messages, { ...message, timestamp: new Date(message.timestamp) }] 
      }))
    });

    socket.on("allMessages", (messages) => {
      set({ messages: messages.map(m => ({...m, timestamp: new Date(m.timestamp)})) });
    });
  },

  closeSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
    },
    
    joinRoom: (roomId, username) => {
    console.log("joinRoom called", roomId, username);
    get().socket?.emit('joinRoom', roomId);
    set({ roomId, username, isJoined: true, messages: [] })
    },
    
    createRoom: (username) => {
    const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
    console.log("createRoom called", roomId, username);
    get().socket?.emit('joinRoom', roomId);
    set({ roomId, username, isJoined: true, messages: [] })
    return roomId;
    },
    
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, { ...message, timestamp: new Date(message.timestamp) }]
    }))
    },
    
    reset: () => {
    get().closeSocket();
    set(initialState);
  },
  
  setUsername: (username: string) => {
    set({ username })
    }
}))