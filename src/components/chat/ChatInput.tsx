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
import { postChatMessage } from '@/lib/api'

const formSchema = z.object({
  text: z.string().optional(), // Make text optional to allow file-only messages
});

type ChatInputForm = z.infer<typeof formSchema>;

export const ChatInput = () => {
  const { socket, roomId, username } = useChatStore()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ChatInputForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "" },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    toast({ title: "File ready!", description: file.name });
  };

  const onSubmit = async (values: ChatInputForm) => {
    if (!socket || (!values.text?.trim() && !selectedFile)) {
      return
    }
    setUploading(true);
    try {
      await postChatMessage({
        username,
        text: values.text || "",
        roomId,
        file: selectedFile || undefined,
      });
      form.reset();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '\ud83d\udcce'}
          </Button>
          <Button type="submit" disabled={!socket || uploading}>
            Send
          </Button>
        </form>
        {selectedFile && (
          <div className="text-xs text-muted-foreground mt-1 px-2">Selected: {selectedFile.name}</div>
        )}
      </Form>
    </div>
  )
}