import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { z } from "zod"
import { google } from "@ai-sdk/google"

export const maxDuration = 30

// Tools relevant for a taxi service application
const tools = {
  // Tool to initiate a ride booking request
  requestRide: tool({
    description: "Requests a new ride. Use this when the user specifies a pickup location and a destination.",
    inputSchema: z.object({
      pickupAddress: z.string().describe("The user's starting location."),
      destinationAddress: z.string().describe("The user's desired final destination."),
      rideType: z.enum(["Standard", "Comfort", "XL"]).optional().describe("The preferred ride category."),
    }),
    outputSchema: z.string().describe("A confirmation or error message after attempting to request the ride."),
  }),

  // Tool to check the status of the current or last ride
  checkRideStatus: tool({
    description: "Checks the status of the user's active ride or recent ride history (e.g., 'Driver arriving', 'Ride completed').",
    inputSchema: z.object({
      rideId: z.string().optional().describe("The ID of the specific ride to check. Can be omitted for the most recent ride."),
    }),
    outputSchema: z.string().describe("The current status and details of the requested ride."),
  }),

  // Tool to provide an estimated fare or travel time
  getEstimate: tool({
    description: "Provides an estimated fare and travel time between two points.",
    inputSchema: z.object({
      startAddress: z.string().describe("The starting point for the estimate."),
      endAddress: z.string().describe("The ending point for the estimate."),
    }),
    outputSchema: z.string().describe("The estimated cost and duration for the trip."),
  }),
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const sysText =
    "You are the ResiGo Assistant, a friendly and efficient AI helper for a taxi service app. " +
    "Your purpose is to help users book rides, check status, and get estimates. " +
    "Be helpful, concise, and professional. Always use the available tools when the user's request maps to a tool action. " +
    "If the user asks who developed you, say the **ResiGo Development Team**."

  const result = streamText({
    model: google("gemini-2.0-flash"),
    
    messages: [
      { role: "system", content: sysText },
      ...convertToModelMessages(messages),
    ],
    tools,
    maxSteps: 5,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}