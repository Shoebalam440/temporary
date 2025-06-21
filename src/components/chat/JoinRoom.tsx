import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MessageSquareText, UserRound } from "lucide-react"
import { useChatStore } from "@/store/chatStore"

// Form schemas
const joinSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  roomId: z.string().min(4, "Room ID must be at least 4 characters"),
})

const createSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
})

type JoinFormValues = z.infer<typeof joinSchema>
type CreateFormValues = z.infer<typeof createSchema>

export const JoinRoom = () => {
  const [activeTab, setActiveTab] = useState<"join" | "create">("create")
  const { joinRoom, createRoom } = useChatStore((state) => ({
    joinRoom: state.joinRoom,
    createRoom: state.createRoom,
  }))
  
  // Form for joining an existing room
  const joinForm = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      username: "",
      roomId: "",
    },
  })

  // Form for creating a new room
  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      username: "",
    },
  })

  const onJoinSubmit = (data: JoinFormValues) => {
    joinRoom(data.roomId, data.username)
  }

  const onCreateSubmit = (data: CreateFormValues) => {
    createRoom(data.username)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex justify-center items-center gap-2">
            <MessageSquareText />
            Quick Chat
          </CardTitle>
          <CardDescription>
            Connect without sign-in. Create or join a temporary private chat room.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" value={activeTab} onValueChange={(value) => setActiveTab(value as "join" | "create")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter your name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="w-full">
                      Create & Join
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="join">
              <Form {...joinForm}>
                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                  <FormField
                    control={joinForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter your name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={joinForm.control}
                    name="roomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter room ID to join" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="w-full">
                      Join Room
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}