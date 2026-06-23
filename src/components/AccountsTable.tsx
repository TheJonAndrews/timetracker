'use client'
import type { Account } from '@/lib/types'

interface Props {
  accounts: Account[]
  onChange: (accounts: Account[]) => void
}

export default function AccountsTable({ accounts, onChange }: Props) {
  function update(index: number, field: keyof Account, value: string | boolean) {
    const updated = accounts.map((a, i) =>
      i === index ? { ...a, [field]: value } : a
    )
    onChange(updated)
  }

  function addRow() {
    onChange([...accounts, { user_id: '', display_name: '', keywords: '', is_internal: false }])
  }

  function removeRow(index: number) {
    onChange(accounts.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-36">Account</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Keywords (comma-separated)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-20">Internal</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account, i) => (
              <tr key={i} className="bg-white">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={account.display_name}
                    onChange={e => update(i, 'display_name', e.target.value)}
                    placeholder="WMATA"
                    className="w-full text-sm text-gray-900 border-0 outline-none bg-transparent placeholder-gray-300"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={account.keywords}
                    onChange={e => update(i, 'keywords', e.target.value)}
                    placeholder="wmata, washington metropolitan"
                    className="w-full text-sm text-gray-900 border-0 outline-none bg-transparent placeholder-gray-300 font-mono"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={account.is_internal}
                    onChange={e => update(i, 'is_internal', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                    aria-label="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="mt-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        + Add account
      </button>
    </div>
  )
}
