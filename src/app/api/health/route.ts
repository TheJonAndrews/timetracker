import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const envChecks = {
    SUPABASE_URL: !!(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    REPORT_API_SECRET: !!process.env.REPORT_API_SECRET,
  }

  let dbConnected = false
  let dbError: string | null = null

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) {
      dbError = error.message
    } else {
      dbConnected = true
    }
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Unknown error'
  }

  const allGood = Object.values(envChecks).every(Boolean) && dbConnected

  return NextResponse.json(
    { status: allGood ? 'ok' : 'degraded', env: envChecks, database: { connected: dbConnected, error: dbError } },
    { status: allGood ? 200 : 503 }
  )
}
