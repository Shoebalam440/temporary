import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MessageSquareText, UserRound, Wifi, WifiOff } from "lucide-react"
import { useChatStore } from "@/store/chatStore"

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  roomId: z.string(),
})

export const JoinRoom = () => {
  const [activeTab, setActiveTab] = useState("create")
  const { joinRoom, createRoom, socket } = useChatStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", roomId: "" },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (activeTab === 'create') {
      createRoom(values.username)
    } else {
      joinRoom(values.roomId, values.username)
    }
  }

  const isConnected = socket && socket.connected

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex justify-center items-center gap-2"><MessageSquareText />Quick Chat</CardTitle>
          <CardDescription>Connect without sign-in. Create or join a temporary private chat room.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="create" className="m-0">
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <div className="flex items-center"><UserRound className="mr-2 h-4 w-4 text-muted-foreground" /><Input placeholder="Enter your name" {...field} /></div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="join" className="m-0">
                  <FormField control={form.control} name="username" render={({ field }) => (
                     <FormItem className="mb-4">
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <div className="flex items-center"><UserRound className="mr-2 h-4 w-4 text-muted-foreground" /><Input placeholder="Enter your name" {...field} /></div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="roomId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room ID</FormLabel>
                      <FormControl><Input placeholder="Enter room ID to join" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full" disabled={!isConnected}>
                    <div className="flex items-center gap-2">
                      {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                      {isConnected ? (activeTab === 'create' ? 'Create & Join' : 'Join Room') : 'Connecting...'}
                    </div>
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}