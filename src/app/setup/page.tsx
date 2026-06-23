'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountsTable from '@/components/AccountsTable'
import type { Account } from '@/lib/types'

const JON_ACCOUNTS: Omit<Account, 'user_id'>[] = [
  { display_name: 'WMATA', keywords: 'wmata, washington metropolitan', is_internal: false },
  { display_name: 'ASFDFO / USCIS', keywords: 'asfdfo, asa, dfo, uscis, immigration, citizenship, oidp, frd, elis', is_internal: false },
  { display_name: 'IL SoS', keywords: 'illinois, il sos, secretary of state, illinois secretary', is_internal: false },
  { display_name: 'US Navy Recruiting', keywords: 'usn recruiting, navy recruiting, nrc', is_internal: false },
  { display_name: 'US Navy Personnel (BUPERS)', keywords: 'bupers, navy personnel, millington', is_internal: false },
  { display_name: 'State of Oregon', keywords: 'oregon, state of oregon', is_internal: true },
]

export default function Setup() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [slackId, setSlackId] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleIdBlur() {
    if (userId.toLowerCase() === 'joandrews' && accounts.length === 0) {
      setAccounts(JON_ACCOUNTS.map(a => ({ ...a, user_id: userId })))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim() || !name.trim() || !slackId.trim()) {
      setError('All fields are required.')
      return
    }

    setSaving(true)
    setError('')

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: { id: userId.trim().toLowerCase(), name: name.trim(), slack_user_id: slackId.trim() },
        accounts: accounts.map(a => ({
          display_name: a.display_name,
          keywords: a.keywords,
          is_internal: a.is_internal,
        })),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
      setSaving(false)
      return
    }

    localStorage.setItem('tt_user_id', userId.trim().toLowerCase())
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Set up your profile</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your details to start tracking time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Your Handle
              </label>
              <input
                type="text"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                onBlur={handleIdBlur}
                placeholder="e.g. joandrews"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 font-mono"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">Use the prefix of your Adobe email — e.g. if your email is joandrews@adobe.com, enter <span className="font-mono">joandrews</span>. This links your reports to your profile.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jon Andrews"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Slack User ID
                </label>
                <input
                  type="text"
                  value={slackId}
                  onChange={e => setSlackId(e.target.value)}
                  placeholder="U09NSR59A92"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Find it in Slack: click your name → View full profile → ⋯ → Copy member ID
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Accounts
              </label>
              <p className="text-xs text-gray-400">
                {userId.toLowerCase() === 'joandrews' ? 'Pre-filled from your profile' : 'Add accounts to match against your calendar and email'}
              </p>
            </div>
            <AccountsTable
              accounts={accounts}
              onChange={setAccounts}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save and open dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
