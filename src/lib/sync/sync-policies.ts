import { createAdminClient } from '@/lib/supabase/admin'
import { Gov24Adapter } from './adapters/gov24'
import type { PolicyAdapter, SyncReport, IncomingPolicy } from './types'

const ADAPTERS: PolicyAdapter[] = [new Gov24Adapter()]

export async function runPolicySync(): Promise<SyncReport> {
  const startedAt = new Date()
  const adapterResults = await Promise.all(ADAPTERS.map((a) => a.fetch()))

  const supabase = createAdminClient()
  let added = 0
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const result of adapterResults) {
    if (!result.ok) {
      errors.push(`[${result.source}] ${result.error}`)
      continue
    }
    for (const incoming of result.policies) {
      try {
        const wrote = await upsertPolicy(supabase, result.source, incoming)
        if (wrote === 'added') added += 1
        else if (wrote === 'updated') updated += 1
        else skipped += 1
      } catch (e) {
        errors.push(
          `[${result.source}:${incoming.external_id}] ${e instanceof Error ? e.message : String(e)}`,
        )
      }
    }
  }

  const completedAt = new Date()

  return {
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    adapters: adapterResults,
    added,
    updated,
    skipped,
    errors,
  }
}

async function upsertPolicy(
  supabase: ReturnType<typeof createAdminClient>,
  source: string,
  incoming: IncomingPolicy,
): Promise<'added' | 'updated' | 'skipped'> {
  const { data: existing } = await supabase
    .from('policies')
    .select('id, source')
    .eq('source', source)
    .eq('external_id', incoming.external_id)
    .maybeSingle()

  if (existing) {
    // 매뉴얼로 source 변경된 경우는 절대 덮어쓰지 않음 (이중 안전장치).
    if (existing.source !== source) return 'skipped'

    const { error } = await supabase
      .from('policies')
      .update({
        title: incoming.title,
        summary: incoming.summary,
        description: incoming.description,
        provider: incoming.provider,
        provider_name: incoming.provider_name,
        category: incoming.category,
        support_type: incoming.support_type,
        support_amount: incoming.support_amount,
        target_stage: incoming.target_stage,
        target_age_min_months: incoming.target_age_min_months,
        target_age_max_months: incoming.target_age_max_months,
        sido_scope: incoming.sido_scope,
        sigungu_scope: incoming.sigungu_scope,
        target_income_max_percentile: incoming.target_income_max_percentile,
        target_qualifications: incoming.target_qualifications,
        target_housing: incoming.target_housing,
        apply_start: incoming.apply_start,
        apply_end: incoming.apply_end,
        apply_place: incoming.apply_place,
        apply_method: incoming.apply_method,
        external_url: incoming.external_url,
        synced_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) throw new Error(error.message)
    return 'updated'
  }

  const { error } = await supabase.from('policies').insert({
    ...incoming,
    source,
    is_active: false, // 신규는 검토 대기 상태로
    synced_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  return 'added'
}
