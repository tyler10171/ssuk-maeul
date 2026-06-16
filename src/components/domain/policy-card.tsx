import Link from 'next/link'
import type { Policy } from '@/types/database'
import {
  STAGE_LABEL,
  PROVIDER_LABEL,
  SUPPORT_TYPE_LABEL,
  formatAmount,
  dDay,
} from '@/lib/policy-format'

const providerColor: Record<'central' | 'sido' | 'sigungu', string> = {
  central: 'bg-blue-100 text-blue-800',
  sido: 'bg-purple-100 text-purple-800',
  sigungu: 'bg-amber-100 text-amber-800',
}

const supportTypeColor: Record<'cash' | 'voucher' | 'service', string> = {
  cash: 'bg-emerald-100 text-emerald-800',
  voucher: 'bg-cyan-100 text-cyan-800',
  service: 'bg-gray-100 text-gray-700',
}

export default function PolicyCard({ policy }: { policy: Policy }) {
  const d = dDay(policy.apply_end)
  const targetStages = policy.target_stage ?? []
  const regionLabel =
    policy.sigungu_scope?.length
      ? policy.sigungu_scope.join(', ')
      : policy.sido_scope?.length
        ? policy.sido_scope.join(', ')
        : '전국'

  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-sm transition flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${providerColor[policy.provider]}`}>
            {PROVIDER_LABEL[policy.provider]}
          </span>
          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${supportTypeColor[policy.support_type]}`}>
            {SUPPORT_TYPE_LABEL[policy.support_type]}
          </span>
          {targetStages.map((s) => (
            <span key={s} className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {STAGE_LABEL[s]}
            </span>
          ))}
        </div>
        {d && (
          <span
            className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-bold ${
              d.urgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {d.label}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 leading-snug">{policy.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{policy.summary}</p>
      </div>

      <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">{policy.provider_name}</p>
          <p className="text-xs text-gray-500">📍 {regionLabel}</p>
        </div>
        <p className="text-emerald-700 font-bold text-base">
          {formatAmount(policy.support_amount, policy.support_type)}
        </p>
      </div>

      {policy.external_url && (
        <Link
          href={policy.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 hover:underline self-end"
        >
          신청 안내 보기 ↗
        </Link>
      )}
    </article>
  )
}
