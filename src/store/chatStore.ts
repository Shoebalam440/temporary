import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial State
      roomId: null,
      username: '',
      messages: [],
      isJoined: false,
      isConnected: false,
      socket: null,

      // Actions
      initSocket: () => {
        if (get().socket) return;
        
        const socket = io(backendUrl);
        
        socket.on("connect", () => set({ isConnected: true, socket }));
        socket.on("disconnect", () => set({ isConnected: false, socket: null }));
        socket.on("newMessage", (message) => get().addMessage(message));
        socket.on("allMessages", (messages) => set({ messages: messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })) }));
      },

      closeSocket: () => {
        get().socket?.disconnect();
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
        set({ roomId: null, messages: [], isJoined: false, isConnected: false, socket: null });
      },
      
      setUsername: (username: string) => {
        set({ username });
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ username: state.username }), // Only persist username
      onRehydrateStorage: (state) => {
        // This function can be used to perform actions after hydration,
        // but we will reset volatile state in the component instead.
        state.isJoined = false;
        state.isConnected = false;
        state.socket = null;
        state.messages = [];
      }
    }
  )
)