import { createServerClient } from './supabase-server'

export async function verifyApiKey(userId: string, authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const supabase = createServerClient()
  const { data } = await supabase.from('users').select('api_key').eq('id', userId).single()
  return !!data?.api_key && data.api_key === token
}
