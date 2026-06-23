export interface Account {
  id?: number
  user_id: string
  display_name: string
  keywords: string
  is_internal: boolean
}

export interface User {
  id: string
  name: string
  slack_user_id: string
  created_at?: string
}

export interface ReportEntry {
  bucket: string
  title: string
  start: string
  end: string
  hours: number
}

export interface ReportAccount {
  name: string
  entries: ReportEntry[]
}

export interface NeedsInputItem {
  title: string
  hours: number
  candidates: string[]
}

export interface StructuredData {
  date: string
  total_hours: number
  accounts: ReportAccount[]
  needs_input: NeedsInputItem[]
}

export interface Report {
  id: number
  user_id: string
  report_date: string
  total_hours: number
  structured_data: StructuredData
  raw_text: string
  created_at: string
}
