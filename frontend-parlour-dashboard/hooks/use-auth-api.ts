import { useAuth } from "@/providers/auth-provider"

export function useAuthApi() {
  return async function authFetch(input: RequestInfo, init: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers = {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    return fetch(input, { ...init, headers })
  }
} 