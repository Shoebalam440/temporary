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
  fileUrl: z.string().url().optional().or(z.literal('')),
})

const backendUrl = "https://temporary-sbhe.onrender.com";

export const ChatInput = () => {
  const { socket, roomId, username } = useChatStore()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "", fileUrl: "" },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('https://file.io', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        form.setValue('fileUrl', data.link);
        toast({ title: "File uploaded!", description: "Link ready to send." });
      } else {
        toast({ title: "Upload failed", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Upload failed", description: "Network error.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!socket || (!values.text.trim() && !values.fileUrl)) {
      return
    }
    const payload = {
      username,
      text: values.text,
      roomId,
      fileUrl: values.fileUrl || undefined,
    }
    try {
      const res = await fetch("https://temporary-sbhe.onrender.com/upload", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      form.reset()
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
          <FormField
            control={form.control}
            name="fileUrl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Paste file link (optional)" {...field} autoComplete="off" />
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
            {uploading ? 'Uploading...' : '📎'}
          </Button>
          <Button type="submit" disabled={!socket || uploading}>
            Send
          </Button>
        </form>
      </Form>
    </div>
  )
}