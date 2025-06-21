import { useEffect, useRef } from "react"
import { useChatStore } from "@/store/chatStore"
import { MessageItem } from "./MessageItem"
import { ChatInput } from "./ChatInput"
import { Button } from "@/components/ui/button"
import { MessageSquareText, Copy, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const ChatRoom = () => {
  const { roomId, messages, username, reset } = useChatStore()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      toast({ title: "Room ID copied!" })
    }
  }
  
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between bg-card p-4 border-b sticky top-0 z-10">
        <div className="flex items-center">
          <MessageSquareText className="h-5 w-5 mr-2 text-primary" />
          <h1 className="text-xl font-semibold">Quick Chat</h1>
        </div>
        <Button onClick={reset} variant="ghost" size="sm">
          <LogOut className="h-4 w-4 mr-1" />
          Leave
        </Button>
      </header>
      
      <div className="bg-muted/50 p-4 border-b">
        <p className="text-sm font-medium">
          You're chatting as <span className="font-semibold">{username}</span>
        </p>
        {roomId && (
          <div className="flex items-center mt-1">
            <span className="text-sm mr-2">Room ID:</span>
            <code className="bg-background px-2 py-1 rounded-md text-xs">{roomId}</code>
            <Button onClick={copyRoomId} variant="ghost" size="icon" className="ml-1 h-7 w-7"><Copy size={14} /></Button>
          </div>
        )}
      </div>
      
      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquareText className="h-12 w-12 mb-2" />
            <p>No messages yet. Send one to start the chat!</p>
          </div>
        ) : (
          messages.map((message) => <MessageItem key={message.id} message={message} />)
        )}
        <div ref={messagesEndRef} />
      </main>
      
      <footer className="p-4 border-t bg-background">
        <ChatInput />
      </footer>
    </div>
  )
}