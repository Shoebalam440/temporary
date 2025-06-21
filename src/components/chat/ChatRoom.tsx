import { useEffect, useRef } from "react"
import { useChatStore } from "@/store/chatStore"
import { MessageItem } from "./MessageItem"
import { ChatInput } from "./ChatInput"
import { Button } from "@/components/ui/button"
import { MessageSquareText, Copy, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const ChatRoom = () => {
  const { roomId, messages, username, reset } = useChatStore((state) => ({
    roomId: state.roomId,
    messages: state.messages,
    username: state.username,
    reset: state.reset,
  }))
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      toast({
        title: "Room ID copied!",
        description: "Share this with someone to chat with them",
      })
    }
  }
  
  const handleLeaveRoom = () => {
    reset()
  }
  
  const renderHeader = () => (
    <div className="flex items-center justify-between bg-card p-4 border-b sticky top-0 z-10">
      <div className="flex items-center">
        <MessageSquareText className="h-5 w-5 mr-2 text-primary" />
        <h1 className="text-xl font-semibold">Quick Chat</h1>
      </div>
      
      <Button onClick={handleLeaveRoom} variant="ghost" size="sm">
        <LogOut className="h-4 w-4 mr-1" />
        Leave
      </Button>
    </div>
  )
  
  const renderRoomInfo = () => (
    <div className="bg-muted/50 p-4 border-b">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          You're chatting as <span className="font-semibold">{username}</span>
        </p>
        {roomId && (
          <div className="flex items-center mt-1">
            <span className="text-sm mr-2">Room ID:</span>
            <code className="room-code">{roomId}</code>
            <Button 
              onClick={copyRoomId} 
              variant="ghost" 
              size="sm" 
              className="ml-1 h-7 w-7 p-0"
            >
              <Copy size={14} />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Share this room ID with someone to chat with them. Messages are temporary and will be lost when you leave.
        </p>
      </div>
    </div>
  )
  
  return (
    <div className="flex flex-col h-screen">
      {renderHeader()}
      {renderRoomInfo()}
      
      <div className="chat-container">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquareText className="h-12 w-12 mb-2" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-background">
        <ChatInput />
      </div>
    </div>
  )
}