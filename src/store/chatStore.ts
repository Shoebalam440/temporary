import { create } from 'zustand'

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
  socket: any | null
  
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
    console.log('initSocket called')
    set({ socket: {} })
  },

  closeSocket: () => {
    console.log('closeSocket called')
    set({ socket: null })
  },

  joinRoom: (roomId, username) => {
    console.log('joinRoom called', roomId, username)
    set({ roomId, username, isJoined: true, messages: [] })
  },
  
  createRoom: (username) => {
    console.log('createRoom called', username)
    const roomId = 'test-room-' + Date.now()
    set({ roomId, username, isJoined: true, messages: [] })
    return roomId
  },
  
  addMessage: (message) => {
    console.log('addMessage called', message)
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },
  
  reset: () => {
    console.log('reset called')
    set(initialState)
  },
  
  setUsername: (username: string) => {
    console.log('setUsername called', username)
    set({ username })
  }
}))