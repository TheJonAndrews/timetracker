import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { verifyApiKey } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  if (!(await verifyApiKey(userId, req.headers.get('authorization')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('report_date', { ascending: false })
      .limit(7)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
