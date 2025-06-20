import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: Date
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
  
  // Actions
  setRoomId: (roomId: string) => void
  setUsername: (username: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  joinRoom: (roomId: string, username: string) => void
  createRoom: (username: string) => string
  setOtherUserName: (name: string) => void
  setMessages: (messages: Message[]) => void
  reset: () => void
}

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
      otherUserName: state.otherUserName
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
  otherUserName: null
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
        timestamp: new Date()
      }
      set((state) => {
        const updatedMessages = [...state.messages, newMessage]
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
    }
  }
})