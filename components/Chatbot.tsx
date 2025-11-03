"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MessageCircle, X, Send, Car } from "lucide-react" 

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, addToolResult } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    async onToolCall({ toolCall }) {
      const name = toolCall.toolName
      const input: any = toolCall.args
      let result = "Tool call executed successfully."


      if (name === "requestRide") {
        result = `Booking service received request: Pickup at '${input.pickupAddress}', Destination at '${input.destinationAddress}'. Type: ${input.rideType || 'Standard'}. Ride ID: RG-${Date.now()}`
      } else if (name === "checkRideStatus") {
        const rideId = input.rideId || 'your most recent ride (RG-123456)'
        result = `Checked status for ${rideId}. Status is: 'Driver John (Honda City, License: XYZ123) is 5 minutes away.'`
      } else if (name === "getEstimate") {
        result = `Estimate service calculated: Trip from '${input.startAddress}' to '${input.endAddress}' will cost approximately $15.50 and take 25 minutes.`
      } else {
        result = `Unknown tool call: ${name}`
      }
      
      addToolResult({ tool: name, toolCallId: toolCall.toolCallId, output: result })
    },
  })

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messages, open])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {open ? (
          <Card className="w-[420px] max-w-[90vw] glass-card border-2 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 bg-background/95 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Updated Icon and Name for Taxi Service */}
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center animate-glow shadow-lg shadow-primary/50">
                  <Car className="w-5 h-5 text-primary" /> {/* Using Car icon */}
                </div>
                <div>
                  <div className="font-semibold text-foreground">ResiGo Assistant</div>
                  <div className="text-xs text-muted-foreground">AI Ride Helper</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div 
              ref={messagesEndRef}
              className="max-h-[50vh] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/40 to-muted/60 backdrop-blur-sm"
            >
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Welcome to ResiGo Assistant</p>
                    <p className="text-sm text-muted-foreground mt-1">Ask me to book a ride, check status, or get an estimate!</p>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                      <Car className="w-4 h-4 text-primary" /> 
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%] shadow-md",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground shadow-primary/30"
                        : "bg-background/90 text-foreground backdrop-blur-sm border border-border/50",
                    )}
                  >
                    {m.parts.map((p, i) =>
                      p.type === "text" ? (
                        <span key={i} className="text-sm leading-relaxed">
                          {p.text}
                        </span>
                      ) : null,
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 shadow-md shadow-accent/30">
                      <span className="text-sm font-medium text-accent">You</span>
                    </div>
                  )}
                </div>
              ))}

              {status === "in_progress" && (
                <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                    <Car className="w-4 h-4 text-primary animate-pulse" /> 
                  </div>
                  <div className="bg-background/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-border/50 shadow-md">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              className="p-4 border-t bg-background/80 backdrop-blur-sm"
              onSubmit={(e) => {
                e.preventDefault()
                const value = (e.currentTarget.elements.namedItem("message") as HTMLInputElement).value
                if (!value) return
                sendMessage({ text: value })
                ;(e.currentTarget.elements.namedItem("message") as HTMLInputElement).value = ""
              }}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  name="message"
                  placeholder="Ask to book a ride or check the status..."
                  className="flex-1 rounded-xl border-2 bg-background/90 backdrop-blur-sm px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors shadow-inner"
                  disabled={status === "in_progress"}
                />
                <Button
                  type="submit"
                  disabled={status === "in_progress"}
                  size="icon"
                  className="w-12 h-12 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="h-14 px-6 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 animate-glow"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            
            <span className="font-medium">Ask ResiGo Assistant</span>
          </Button>
        )}
      </div>
    </>
  )
}
