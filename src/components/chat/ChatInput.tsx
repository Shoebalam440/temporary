import { useState, useRef, ChangeEvent, FormEvent } from "react"
import { Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { readFileAsDataURL, formatFileSize } from "@/lib/fileUtils"
import { useChatStore } from "@/store/chatStore"
import { useToast } from "@/hooks/use-toast"

export const ChatInput = () => {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMessage = useChatStore((state) => state.addMessage)
  const { toast } = useToast()
  const username = useChatStore((state) => state.username)
  const backendUrl = "https://temporary-sbhe.onrender.com"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && !file) return
    
    try {
      let fileData = null

      // 1. Upload file if present
      if (file) {
        const formData = new FormData()
        formData.append("file", file)

        const uploadRes = await fetch(`${backendUrl}/upload`, {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) throw new Error("File upload failed")
        const uploadJson = await uploadRes.json()

        fileData = {
          name: file.name,
          url: `${backendUrl}/uploads/${uploadJson.file}`,
          type: file.type,
          size: file.size,
        }
      }

      // 2. Send message to backend
      const msgRes = await fetch(`${backendUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || "me",
          text: message.trim(),
          file: fileData,
        }),
      })

      if (!msgRes.ok) throw new Error("Message send failed")
      const msgJson = await msgRes.json()

      // Reset form
      setMessage("")
      setFile(null)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error sending message",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive"
        })
        return
      }
      setFile(selectedFile)
    }
  }
  
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  
  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {file && (
        <div className="bg-muted p-2 rounded-md flex items-center gap-2">
          <span className="text-sm truncate flex-1">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={removeFile}
            className="h-6 px-2"
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="shrink-0" 
          onClick={triggerFileInput}
        >
          <Paperclip size={18} />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,application/pdf,text/*,audio/*,video/*"
          />
        </Button>
        
        <Input 
          className="chat-input"
          placeholder="Type a message..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
        />
        
        <Button 
          type="submit" 
          className="rounded-full h-12 w-12 shrink-0" 
          disabled={!message.trim() && !file}
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  )
}