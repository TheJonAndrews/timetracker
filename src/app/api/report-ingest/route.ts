import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const payload = req.nextUrl.searchParams.get('payload')
  const secret = process.env.REPORT_API_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!payload) {
    return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
  }

  let body: {
    user_id?: string
    report_date?: string
    total_hours?: number
    structured_data?: unknown
    raw_text?: string
  }

  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
    body = JSON.parse(decoded)
  } catch {
    return NextResponse.json({ error: 'Invalid payload encoding' }, { status: 400 })
  }

  const { user_id, report_date, total_hours, structured_data, raw_text } = body

  if (!user_id || !report_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('reports')
      .upsert(
        { user_id, report_date, total_hours, structured_data, raw_text },
        { onConflict: 'user_id,report_date' }
      )

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
