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
import { useEffect } from "react"

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  roomId: z.string(),
})

export const JoinRoom = () => {
  const [activeTab, setActiveTab] = useState("create")
  const { joinRoom, createRoom, socket } = useChatStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", roomId: "" },
  })

  async function waitForConnection(timeout = 5000) {
    return new Promise<boolean>((resolve) => {
      if (socket && socket.connected) return resolve(true)
      const start = Date.now()
      const check = () => {
        if (socket && socket.connected) return resolve(true)
        if (Date.now() - start > timeout) return resolve(false)
        setTimeout(check, 100)
      }
      check()
    })
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    if (!socket || !socket.connected) {
      setLoading(true)
      const connected = await waitForConnection(5000)
      setLoading(false)
      if (!connected) {
        setError("Unable to connect to server. Please try again later.")
        return
      }
    }
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
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input className="pl-9" placeholder="Enter your name" {...field} autoComplete="name" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="join" className="m-0">
                  <FormField control={form.control} name="username" render={({ field }) => (
                     <FormItem className="mb-4">
                      <FormLabel>Your Name</FormLabel>
                       <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input className="pl-9" placeholder="Enter your name" {...field} autoComplete="name" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="roomId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room ID</FormLabel>
                      <FormControl><Input placeholder="Enter room ID to join" {...field} autoComplete="off" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                <CardFooter className="px-0 pt-4 flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    <div className="flex items-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                          Connecting...
                        </>
                      ) : (
                        <>
                          {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                          {activeTab === 'create' ? 'Create & Join' : 'Join Room'}
                        </>
                      )}
                    </div>
                  </Button>
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                </CardFooter>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}