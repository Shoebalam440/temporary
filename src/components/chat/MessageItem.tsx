import { Message, useChatStore } from "@/store/chatStore"
import { format, parseISO } from "date-fns"
import { FileText, Download, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadFile, isImageFile } from "@/lib/fileUtils"

interface MessageItemProps {
  message: Message
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const currentUser = useChatStore((state) => state.username)
  const isMyMessage = message.username === currentUser
  const formattedTime = format(
    typeof message.timestamp === "string"
      ? parseISO(message.timestamp)
      : message.timestamp,
    "HH:mm"
  )
  
  const handleDownload = () => {
    if (message.file) {
      downloadFile(message.file.url, message.file.name)
    }
  }
  
  return (
    <div className={`flex flex-col mb-4 ${isMyMessage ? "items-end" : "items-start"}`}>
      <div className={`message-bubble ${isMyMessage ? "my-message" : "other-message"}`}>
        {!isMyMessage && <div className="font-bold text-xs mb-1">{message.username}</div>}
        {message.text}
        
        {message.file && (
          <div className="file-attachment">
            {message.file.type.startsWith("image/") ? (
              <div className="flex flex-col">
                <div className="mb-2 flex items-center">
                  <Image size={16} className="mr-1" />
                  <span className="text-sm">{message.file.name}</span>
                </div>
                <img 
                  src={message.file.url} 
                  alt={message.file.name} 
                  className="max-w-full max-h-60 rounded-md object-contain"
                />
              </div>
            ) : (
              <>
                <FileText size={16} />
                <span>{message.file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto h-6 w-6"
                  onClick={handleDownload}
                >
                  <Download size={14} />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="message-time">
        {formattedTime}
      </div>
    </div>
  )
}