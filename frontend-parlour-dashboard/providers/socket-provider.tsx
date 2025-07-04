"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-provider"

interface SocketContextType {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token")
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
      })

      socketInstance.on("connect", () => setConnected(true))
      socketInstance.on("disconnect", () => setConnected(false))

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [user])

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within SocketProvider")
  return context
}
