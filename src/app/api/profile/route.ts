import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  try {
    const supabase = createServerClient()

    const [{ data: user, error: userErr }, { data: accounts, error: accErr }] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('accounts').select('*').eq('user_id', userId).order('id'),
    ])

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 404 })
    if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 })

    return NextResponse.json({ user, accounts })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  try {
    const { accounts } = await req.json()
    const supabase = createServerClient()

    await supabase.from('accounts').delete().eq('user_id', userId)

    if (accounts?.length) {
      const rows = accounts.map((a: { display_name: string; keywords: string; is_internal: boolean }) => ({
        user_id: userId,
        display_name: a.display_name,
        keywords: a.keywords,
        is_internal: a.is_internal ?? false,
      }))
      const { error } = await supabase.from('accounts').insert(rows)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
