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
  messages: Message[]
  username: string
  isJoined: boolean
  otherUserName: string | null
  socket: Socket | null
  
  // Actions
  setRoomId: (roomId: string) => void
  setUsername: (username: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  joinRoom: (roomId: string, username: string) => void
  createRoom: (username: string) => string
  setOtherUserName: (name: string) => void
  setMessages: (messages: Message[]) => void
  reset: () => void
  initSocket: () => void
  closeSocket: () => void
}

const backendUrl = "https://temporary-sbhe.onrender.com";
let socket: Socket | null = null;

// Helper function to load state from local storage
const loadState = () => {
  try {
    const savedState = localStorage.getItem('chatState')
    if (savedState) {
      const parsed = JSON.parse(savedState)
      return {
        ...parsed,
        messages: parsed.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }
    }
  } catch (error) {
    console.error('Failed to load state:', error)
  }
  return null
}

// Helper function to save state to local storage
const saveState = (state: Partial<ChatState>) => {
  try {
    const stateToSave = {
      roomId: state.roomId,
      messages: state.messages,
      username: state.username,
      isJoined: state.isJoined,
      otherUserName: state.otherUserName,
      socket: state.socket
    }
    localStorage.setItem('chatState', JSON.stringify(stateToSave))
  } catch (error) {
    console.error('Failed to save state:', error)
  }
}

// Initial state
const initialState = {
  roomId: null,
  messages: [],
  username: '',
  isJoined: false,
  otherUserName: null,
  socket: null,
}

export const useChatStore = create<ChatState>((set, get) => {
  // Try to load saved state
  const savedState = loadState()
  
  return {
    // Use saved state or initial state
    ...initialState,
    ...(savedState || {}),
    
    setRoomId: (roomId) => {
      set({ roomId })
      saveState({ ...get(), roomId })
    },
    
    setUsername: (username) => {
      set({ username })
      saveState({ ...get(), username })
    },
    
    addMessage: (message) => {
      const newMessage = {
        ...message,
        id: uuidv4(),
        timestamp: new Date().toISOString()
      }
      set((state) => {
        // Prevent adding duplicate messages
        if (state.messages.some(m => m.id === newMessage.id)) {
          return state
        }
        const updatedMessages = [...state.messages, { ...newMessage, timestamp: new Date(newMessage.timestamp) }]
        saveState({ ...state, messages: updatedMessages })
        return { messages: updatedMessages }
      })
    },
    
    joinRoom: (roomId, username) => {
      set({ roomId, username, isJoined: true })
      saveState({ ...get(), roomId, username, isJoined: true })
    },
    
    createRoom: (username) => {
      const roomId = uuidv4().substring(0, 8) // Shorter, more user-friendly ID
      set({ roomId, username, isJoined: true })
      saveState({ ...get(), roomId, username, isJoined: true })
      return roomId
    },
    
    setOtherUserName: (name) => {
      set({ otherUserName: name })
      saveState({ ...get(), otherUserName: name })
    },
    
    setMessages: (messages) => {
      set({ messages })
      saveState({ ...get(), messages })
    },
    
    reset: () => {
      set(initialState)
      localStorage.removeItem('chatState')
    },

    initSocket: () => {
      // Prevent creating a new socket if one already exists
      if (get().socket) return;

      const newSocket = io(backendUrl);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("newMessage", (message) => {
        // We need a way to add messages from the server
        // This assumes the incoming message has the full Message shape
        set((state) => ({ messages: [...state.messages, { ...message, timestamp: new Date(message.timestamp) }] }));
      });
      
      set({ socket: newSocket });
    },

    closeSocket: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
        set({ socket: null });
      }
    }
  }
})