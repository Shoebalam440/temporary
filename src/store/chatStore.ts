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

export const useChatStore = create<ChatState>((set, get) => ({
  roomId: null,
  username: '',
  messages: [],
  isJoined: false,
  socket: null,

  initSocket: () => {
    if (get().socket) return;
    const socket = io(backendUrl);
    
    socket.on("connect", () => {
      set({ socket });
    });
    
    socket.on("disconnect", () => {
      set({ socket: null });
    });

    socket.on("newMessage", (message) => get().addMessage(message));
    socket.on("allMessages", (messages) => set({ messages: messages.map(m => ({...m, timestamp: new Date(m.timestamp)})) }));
    
    // Set the socket immediately for other components to use
    set({ socket });
  },

  closeSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
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
    set((state) => ({
      messages: [...state.messages, { ...message, timestamp: new Date(message.timestamp) }]
    }));
  },
  
  reset: () => {
    get().closeSocket();
    set({
      roomId: null,
      username: '',
      messages: [],
      isJoined: false,
      socket: null,
    });
  },
  
  setUsername: (username: string) => {
    set({ username });
  }
}))