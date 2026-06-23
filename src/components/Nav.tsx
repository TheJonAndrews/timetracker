'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav({ userId }: { userId?: string }) {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/profile', label: 'Settings' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900 text-sm tracking-wide">TAM Time Tracker</span>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      {userId && (
        <span className="text-xs text-gray-400 font-mono">{userId}</span>
      )}
    </nav>
  )
}
