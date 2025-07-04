"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useSocket } from "@/providers/socket-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Users, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Employee {
  _id: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
}

interface Task {
  _id: string
  title: string
  description: string
  assignedTo: Employee
  status: "pending" | "in_progress" | "completed"
  dueDate: string
}

interface AttendanceLog {
  _id: string
  employee: Employee
  action: "punch_in" | "punch_out"
  timestamp: string
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const { toast } = useToast()
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  })

  const [taskForm, setTaskForm] = useState<{
    title: string
    description: string
    assignedTo: string
    status: "pending" | "in_progress" | "completed"
    dueDate: string
  }>({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending",
    dueDate: "",
  })

  useEffect(() => {
    fetchEmployees()
    fetchTasks()
    fetchAttendanceLogs()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("attendance_update", (log: AttendanceLog) => {
        setAttendanceLogs((prev) => [log, ...prev.slice(0, 9)])
        toast({
          title: "Attendance Update",
          description: `${log.employee?.name || "-"} ${log.action === "punch_in" ? "punched in" : "punched out"}`,
        })
      })

      return () => {
        socket.off("attendance_update")
      }
    }
  }, [socket, toast])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const fetchAttendanceLogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      setAttendanceLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch attendance logs:", error)
    }
  }

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.role !== "super_admin") return

    try {
      const url = editingEmployee
        ? `${process.env.NEXT_PUBLIC_API_URL}/employees/${editingEmployee._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/employees`

      const response = await fetch(url, {
        method: editingEmployee ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(employeeForm),
      })

      if (response.ok) {
        fetchEmployees()
        setShowEmployeeDialog(false)
        setEditingEmployee(null)
        setEmployeeForm({ name: "", email: "", role: "", department: "" })
        toast({
          title: "Success",
          description: `Employee ${editingEmployee ? "updated" : "created"} successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save employee",
        variant: "destructive",
      })
    }
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.role !== "super_admin") return

    try {
      const url = editingTask
        ? `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTask._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/tasks`

      const response = await fetch(url, {
        method: editingTask ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(taskForm),
      })

      if (response.ok) {
        fetchTasks()
        setShowTaskDialog(false)
        setEditingTask(null)
        setTaskForm({ title: "", description: "", assignedTo: "", status: "pending", dueDate: "" })
        toast({
          title: "Success",
          description: `Task ${editingTask ? "updated" : "created"} successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      })
    }
  }

  const deleteEmployee = async (id: string) => {
    if (user?.role !== "super_admin") return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (response.ok) {
        fetchEmployees()
        toast({ title: "Success", description: "Employee deleted successfully" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (id: string) => {
    if (user?.role !== "super_admin") return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (response.ok) {
        fetchTasks()
        toast({ title: "Success", description: "Task deleted successfully" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const toggleEmployeeActive = async (id: string, isActive: boolean) => {
    if (user?.role !== "super_admin") return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (response.ok) {
        fetchEmployees()
        toast({ title: "Success", description: `Employee marked as ${!isActive ? "Active" : "Inactive"}` })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update employee status", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-md border-b sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-indigo-700 dark:text-white tracking-tight drop-shadow">💈 Parlour Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === "super_admin" && (
              <Button variant="secondary" onClick={() => router.push("/attendance")}>Go to Attendance</Button>
            )}
            <Badge variant="outline" className="uppercase tracking-wide text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 border-0">{user?.role.replace("_", " ")}</Badge>
            <span className="text-base font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
            <Button variant="outline" className="hover:bg-indigo-100 dark:hover:bg-indigo-800 transition" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Employees & Tasks Section */}
          <div className="lg:col-span-2 space-y-10">
            {/* Employees Section */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90">
              <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-indigo-200">
                    <Users className="h-5 w-5" /> Employees
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">Manage employee records</CardDescription>
                </div>
                {user?.role === "super_admin" && (
                  <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow transition">
                        <Plus className="h-4 w-4 mr-2" /> Add Employee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md w-full">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-200">{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Input id="role" value={employeeForm.role} onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })} required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="department">Department</Label>
                          <Input id="department" value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} required className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow transition">
                          {editingEmployee ? "Update" : "Create"} Employee
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <TableHeader>
                    <TableRow className="bg-indigo-50 dark:bg-indigo-900">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      {user?.role === "super_admin" && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(employees) ? employees : []).map((employee) => (
                      <TableRow key={employee._id} className="hover:bg-indigo-50 dark:hover:bg-indigo-800 transition">
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          <Badge variant={employee.isActive ? "default" : "secondary"} className={employee.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}>
                            {employee.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {user?.role === "super_admin" && (
                            <Button size="sm" variant="outline" className="ml-2" onClick={() => toggleEmployeeActive(employee._id, employee.isActive)}>
                              {employee.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                        </TableCell>
                        {user?.role === "super_admin" && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="hover:bg-indigo-100 dark:hover:bg-indigo-800" onClick={() => {
                                setEditingEmployee(employee)
                                setEmployeeForm({
                                  name: employee.name,
                                  email: employee.email,
                                  role: employee.role,
                                  department: employee.department,
                                })
                                setShowEmployeeDialog(true)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-red-100 dark:hover:bg-red-800" onClick={() => deleteEmployee(employee._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90">
              <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-indigo-200">
                    <CheckCircle className="h-5 w-5" /> Tasks
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">Manage employee tasks</CardDescription>
                </div>
                {user?.role === "super_admin" && (
                  <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow transition">
                        <Plus className="h-4 w-4 mr-2" /> Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md w-full">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-200">{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTaskSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input id="description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="assignedTo">Assign To</Label>
                          <Select value={taskForm.assignedTo} onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee._id} value={employee._id}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={taskForm.status} onValueChange={(value) => setTaskForm({ ...taskForm, status: value as "pending" | "in_progress" | "completed" })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input id="dueDate" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow transition">
                          {editingTask ? "Update" : "Create"} Task
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <TableHeader>
                    <TableRow className="bg-indigo-50 dark:bg-indigo-900">
                      <TableHead>Title</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      {user?.role === "super_admin" && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(tasks) ? tasks : []).map((task) => (
                      <TableRow key={task._id} className="hover:bg-indigo-50 dark:hover:bg-indigo-800 transition">
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.assignedTo?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === "completed"
                                ? "default"
                                : task.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              task.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : task.status === "in_progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-200 text-gray-500"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        {user?.role === "super_admin" && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="hover:bg-indigo-100 dark:hover:bg-indigo-800" onClick={() => {
                                setEditingTask(task)
                                setTaskForm({
                                  title: task.title,
                                  description: task.description,
                                  assignedTo: task.assignedTo?._id || "",
                                  status: task.status,
                                  dueDate: task.dueDate.split("T")[0],
                                })
                                setShowTaskDialog(true)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-red-100 dark:hover:bg-red-800" onClick={() => deleteTask(task._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Live Attendance Section */}
          <div>
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-indigo-200">
                  <Clock className="h-5 w-5" /> Live Attendance
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Real-time punch in/out logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(attendanceLogs) ? attendanceLogs.map((log) => (
                    <div key={log._id} className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg shadow-sm">
                      <div>
                        <p className="font-medium text-indigo-800 dark:text-indigo-100">{log.employee?.name || "-"}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <Badge variant={log.action === "punch_in" ? "default" : "secondary"} className={log.action === "punch_in" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}>
                        {log.action === "punch_in" ? "In" : "Out"}
                      </Badge>
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
