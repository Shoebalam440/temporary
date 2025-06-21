import { useEffect } from "react"
import { JoinRoom } from "@/components/chat/JoinRoom"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { useChatStore } from "@/store/chatStore"

function ChatPage() {
  const { isJoined, initSocket, closeSocket } = useChatStore()

  useEffect(() => {
    initSocket()
    return () => {
      closeSocket()
    }
  }, []) // Empty dependency array to prevent infinite loops

  return (
    <div className="min-h-screen bg-background">
      {isJoined ? <ChatRoom /> : <JoinRoom />}
    </div>
  )
}

export default ChatPage