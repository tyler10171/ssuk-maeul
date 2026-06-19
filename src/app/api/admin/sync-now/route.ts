import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/queries'
import { isAdmin } from '@/lib/admin'
import { runPolicySync } from '@/lib/sync/sync-policies'

export async function POST() {
  const { user } = await getCurrentSession()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: '권한이 없어요' }, { status: 403 })
  }

  const report = await runPolicySync()
  console.log('[admin manual sync]', JSON.stringify(report))

  return NextResponse.json(report)
}
