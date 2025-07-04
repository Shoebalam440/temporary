import { Message, useChatStore } from "@/store/chatStore"
import { format } from "date-fns"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export const MessageItem = ({ message }: { message: Message }) => {
  const username = useChatStore((state) => state.username)
  const isMyMessage = message.username === username
  
  const handleDownload = () => {
    if (message.file) {
      window.open(message.file.url, '_blank')
    }
  }

  const formatTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      return format(date, "HH:mm")
    } catch {
      return "00:00"
    }
  }

  return (
    <div className={`flex flex-col mb-4 ${isMyMessage ? "items-end" : "items-start"}`}>
      <div className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : ""}`}>
        <div className={`max-w-xs p-3 rounded-lg ${isMyMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          {!isMyMessage && <div className="font-bold text-xs mb-1 text-primary">{message.username}</div>}
          <p className="text-sm">{message.text}</p>
          
          {message.file && message.file.url && (
            <div className="mt-2">
              {message.file.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={message.file.url} alt={message.file.url} className="max-w-full max-h-60 rounded-md object-contain cursor-pointer" onClick={handleDownload} />
              ) : (
                <div className="flex items-center justify-between bg-background/50 p-2 rounded-md">
                  <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm truncate">Download/View File</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`text-xs text-muted-foreground mt-1 px-2 ${isMyMessage ? "text-right" : "text-left"}`}>
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}