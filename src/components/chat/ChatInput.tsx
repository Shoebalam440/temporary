import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useChatStore } from '@/store/chatStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Paperclip, Send, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  text: z.string(),
})

const backendUrl = "https://temporary-sbhe.onrender.com";

export const ChatInput = () => {
  const { socket, roomId, username } = useChatStore()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "" },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        })
        return
      }
      setFile(selectedFile)
    }
  }
  
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!socket || (!values.text.trim() && !file)) {
      return
    }

    const formData = new FormData()
    formData.append('username', username)
    formData.append('text', values.text)
    formData.append('roomId', roomId!)
    if (file) {
      formData.append('file', file)
    }

    try {
      const res = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      
      form.reset()
      removeFile()

    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="relative">
      {file && (
        <div className="absolute bottom-full left-0 right-0 p-2 bg-muted rounded-t-md">
            <div className="flex items-center justify-between bg-background p-2 rounded-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip size={16} className="text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground truncate">{file.name}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
                    <X size={16} />
                </Button>
            </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Type a message..." {...field} autoComplete="off" />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={18} />
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button type="submit" disabled={!socket}>
            <Send size={18} />
          </Button>
        </form>
      </Form>
    </div>
  )
}