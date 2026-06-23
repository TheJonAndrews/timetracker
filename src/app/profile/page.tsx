'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import AccountsTable from '@/components/AccountsTable'
import type { Account } from '@/lib/types'

export default function Profile() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('tt_user_id')
    const apiKey = localStorage.getItem('tt_api_key')
    if (!id || !apiKey) { router.push('/setup'); return }
    setUserId(id)

    fetch(`/api/profile?user_id=${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then(r => r.json())
      .then(data => {
        setAccounts(data.accounts ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setError('')
    setSaved(false)

    const apiKey = localStorage.getItem('tt_api_key') ?? ''
    const res = await fetch(`/api/profile?user_id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ accounts }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to save.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userId={userId ?? undefined} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Edit the accounts and keywords used to classify your calendar events and emails.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>

        <AccountsTable accounts={accounts} onChange={setAccounts} />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 font-medium">Updating the live routine</p>
          <p className="text-xs text-amber-700 mt-1">
            Changes here update the display and future report classification in the app.
            To apply new keywords to the cloud routine itself, ask Claude Code to update the routine config.
          </p>
        </div>
      </main>
    </div>
  )
}
