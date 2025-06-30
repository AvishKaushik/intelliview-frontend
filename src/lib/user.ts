import { jwtDecode } from "jwt-decode"
import { getIdToken } from "@/lib/oidcClient"

interface JwtPayload {
  sub: string
  email?: string
  [k: string]: unknown
}

/**
 * Returns the userʼs Cognito `sub` if logged in, otherwise "anonymous".
 */
export function getUserId(): string {
  const token = getIdToken()
  if (!token) return "anonymous"
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.sub || "anonymous"
  } catch {
    return "anonymous"
  }
}
