'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import DayCard from '@/components/DayCard'
import type { Report } from '@/lib/types'

function getPast7Days(): string[] {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function Dashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem('tt_user_id')
    const apiKey = localStorage.getItem('tt_api_key')
    if (!id || !apiKey) {
      router.push('/setup')
      return
    }
    setUserId(id)

    fetch(`/api/reports?user_id=${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then(r => r.json())
      .then(data => {
        setReports(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const days = getPast7Days()
  const reportsByDate = Object.fromEntries(reports.map(r => [r.report_date, r]))

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
          <h1 className="text-lg font-semibold text-gray-900">Last 7 Days</h1>
          <p className="text-xs text-gray-400">Reports arrive automatically at 4 PM ET</p>
        </div>

        <div className="space-y-3">
          {days.map(dateStr => (
            <DayCard
              key={dateStr}
              report={reportsByDate[dateStr] ?? null}
              dateStr={dateStr}
            />
          ))}
        </div>

        {reports.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">No reports yet.</p>
            <p className="text-xs text-gray-300 mt-1">Your first summary will appear here after 4 PM today.</p>
          </div>
        )}
      </main>
    </div>
  )
}
