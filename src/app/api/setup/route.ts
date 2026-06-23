import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { user, accounts } = await req.json()

    if (!user?.id || !user?.name || !user?.slack_user_id) {
      return NextResponse.json({ error: 'Missing user fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error: userError } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    if (accounts?.length) {
      await supabase.from('accounts').delete().eq('user_id', user.id)

      const rows = accounts.map((a: { display_name: string; keywords: string; is_internal: boolean }) => ({
        user_id: user.id,
        display_name: a.display_name,
        keywords: a.keywords,
        is_internal: a.is_internal ?? false,
      }))

      const { error: accountsError } = await supabase.from('accounts').insert(rows)
      if (accountsError) {
        return NextResponse.json({ error: accountsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
