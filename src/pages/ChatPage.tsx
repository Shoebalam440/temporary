import { useEffect } from "react"
import { JoinRoom } from "@/components/chat/JoinRoom"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { useChatStore } from "@/store/chatStore"
import { useToast } from "@/hooks/use-toast"

function ChatPage() {
  const isJoined = useChatStore((state) => state.isJoined)
  const { toast } = useToast()

  useEffect(() => {
    // Simple mock server connection notification
    if (isJoined) {
      const timeout = setTimeout(() => {
        toast({
          title: "Connected to chat room",
          description: "You can now start messaging",
        })
      }, 1000)
      
      return () => clearTimeout(timeout)
    }
  }, [isJoined, toast])

  return (
    <div className="min-h-screen bg-background">
      {isJoined ? <ChatRoom /> : <JoinRoom />}
    </div>
  )
}

export default ChatPage