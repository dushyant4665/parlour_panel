"use client"

import { useEffect, useState } from "react"
import { useSocket } from "@/providers/socket-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"

interface Employee {
  _id: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  lastPunchAction?: "punch_in" | "punch_out"
  lastPunchTime?: string
}

export default function AttendancePage() {
  const { socket } = useSocket()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "super_admin") {
        router.replace("/dashboard")
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("attendance_update", () => {
        fetchEmployees()
      })

      return () => {
        socket.off("attendance_update")
      }
    }
  }, [socket])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await response.json()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      setEmployees([])
    }
  }

  const handlePunch = async (employeeId: string, action: "punch_in" | "punch_out") => {
    setLoading(employeeId)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/punch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, action }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message,
        })
        fetchEmployees()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Employee Attendance</h1>
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Front Desk
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Punch In/Out
            </CardTitle>
            <CardDescription>Click the buttons below to record employee attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(employees) ? employees : [])
                .filter((emp) => emp.isActive)
                .map((employee) => (
                  <div key={employee._id} className="p-4 border rounded-lg bg-white">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                      <p className="text-sm text-gray-600">{employee.department}</p>

                      {employee.lastPunchTime && (
                        <div className="mt-2">
                          <Badge
                            variant={employee.lastPunchAction === "punch_in" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            Last: {employee.lastPunchAction === "punch_in" ? "In" : "Out"} at{" "}
                            {new Date(employee.lastPunchTime).toLocaleTimeString()}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handlePunch(employee._id, "punch_in")}
                        disabled={loading === employee._id}
                        className="flex-1"
                        variant={employee.lastPunchAction === "punch_in" ? "secondary" : "default"}
                      >
                        {loading === employee._id ? "..." : "Punch In"}
                      </Button>
                      <Button
                        onClick={() => handlePunch(employee._id, "punch_out")}
                        disabled={loading === employee._id}
                        className="flex-1"
                        variant={employee.lastPunchAction === "punch_out" ? "secondary" : "outline"}
                      >
                        {loading === employee._id ? "..." : "Punch Out"}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
