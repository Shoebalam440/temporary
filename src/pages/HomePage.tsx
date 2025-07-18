import { MessageSquareText, Lock, Clock, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useChatStore } from '@/store/chatStore'

function HomePage() {
  const navigate = useNavigate()
  const reset = useChatStore((state) => state.reset)

  const handleStartChat = () => {
    reset()
    navigate('/chat')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/20 py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-6">
            <MessageSquareText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">fiveminor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Connect instantly, share files, and chat securely without sharing personal information.
            Perfect for quick conversations when privacy matters.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleStartChat}>
            Start Chatting
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Private & Anonymous</CardTitle>
              <CardDescription>
                No sign-up required. No phone number or personal information needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              Create a room instantly with a unique ID. Share the room ID with someone you want to chat with.
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <FileImage className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Share Files</CardTitle>
              <CardDescription>
                Send images and files securely through the chat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              Upload and share photos, documents, and other files during your conversation.
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Temporary</CardTitle>
              <CardDescription>
                All conversations are temporary and disappear when you leave.
              </CardDescription>
            </CardHeader>
            <CardContent>
              Nothing is stored permanently. Your privacy is protected by design.
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
          <Button size="lg" onClick={handleStartChat}>
            Start a New Chat
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>All rights reserved to shoeb alam.</p>
          <p className="mt-2">Contact: <a href="mailto:shoebalam@anjumanengg.edu.in" className="text-primary hover:underline">shoebalam@anjumanengg.edu.in</a></p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage