import { getUserId } from "./user"

export async function fetchSkills() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT}/skills?userId=${await getUserId()}`)
    if (!res.ok) throw new Error(await res.text())
    return res.json() as Promise<{
      sessionsAnalyzed: number
      avgRatings: Record<string, number>
      topStrengths: [string, number][]
      topWeaknesses: [string, number][]
    }>
  }
  