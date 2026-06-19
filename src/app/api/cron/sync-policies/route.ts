import { NextResponse } from 'next/server'
import { runPolicySync } from '@/lib/sync/sync-policies'

// Vercel Cron이 매일 KST 03:00에 호출. vercel.json 의 crons 설정 참조.
// 외부에서 직접 호출 막기 위해 CRON_SECRET 헤더 검증.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET ?? ''

  // Vercel Cron은 자동으로 Authorization: Bearer <CRON_SECRET> 헤더를 붙임.
  // 로컬·관리자 수동 트리거는 별도 경로(/api/admin/sync-now) 사용.
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const report = await runPolicySync()
  console.log('[cron sync-policies]', JSON.stringify(report))

  return NextResponse.json(report)
}
