import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.REPORT_API_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { user_id, report_date, total_hours, structured_data, raw_text } = body

  if (!user_id || !report_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

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
}
