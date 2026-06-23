'use client'
import { useState } from 'react'
import type { Report } from '@/lib/types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
}

export default function DayCard({ report }: { report: Report | null; dateStr: string }) {
  const [expanded, setExpanded] = useState(false)

  if (!report) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-4 opacity-50">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">No report</p>
      </div>
    )
  }

  const { day, date } = formatDate(report.report_date)
  const sd = report.structured_data
  const accountsWithEntries = sd?.accounts?.filter(a => a.entries?.length > 0) ?? []
  const needsInput = sd?.needs_input ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <button
        className="w-full text-left p-4 flex items-start justify-between gap-4"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{day}</span>
            <span className="text-sm font-medium text-gray-700">{date}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">{report.total_hours}</span>
            <span className="text-sm text-gray-400">hrs</span>
          </div>
          {needsInput.length > 0 && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              {needsInput.length} needs input
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          {accountsWithEntries.slice(0, 3).map(a => (
            <p key={a.name} className="text-xs text-gray-500 truncate max-w-32">{a.name}</p>
          ))}
          {accountsWithEntries.length > 3 && (
            <p className="text-xs text-gray-400">+{accountsWithEntries.length - 3} more</p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
          {accountsWithEntries.map(account => (
            <div key={account.name}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{account.name}</p>
              <div className="space-y-1">
                {account.entries.map((entry, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs">{entry.bucket} — </span>
                      <span className="text-gray-700">{entry.title}</span>
                      {entry.start && (
                        <span className="text-gray-400 text-xs ml-1">({entry.start}–{entry.end})</span>
                      )}
                    </div>
                    <span className="text-gray-600 text-xs whitespace-nowrap shrink-0">{entry.hours} hr</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {needsInput.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">Needs Your Input</p>
              <div className="space-y-1.5">
                {needsInput.map((item, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded p-2 text-sm">
                    <p className="text-gray-700 font-medium">{item.title} — {item.hours} hr</p>
                    <p className="text-amber-700 text-xs mt-0.5">Could be: {item.candidates.join(' / ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.raw_text && (
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Raw report</summary>
              <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap font-mono bg-gray-50 rounded p-2 overflow-x-auto">
                {report.raw_text}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
