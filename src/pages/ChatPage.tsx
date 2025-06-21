import { useEffect } from "react"
import { JoinRoom } from "@/components/chat/JoinRoom"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { useChatStore } from "@/store/chatStore"

function ChatPage() {
  const { isJoined, initSocket, closeSocket } = useChatStore((state) => ({
    isJoined: state.isJoined,
    initSocket: state.initSocket,
    closeSocket: state.closeSocket,
  }))

  useEffect(() => {
    initSocket()
    return () => {
      closeSocket()
    }
  }, [initSocket, closeSocket])

  return (
    <div className="min-h-screen bg-background">
      {isJoined ? <ChatRoom /> : <JoinRoom />}
    </div>
  )
}

export default ChatPage