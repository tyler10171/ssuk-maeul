'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SIDO_LIST, SIGUNGU_MAP, type Sido } from '@/lib/korean-regions'
import type { Policy } from '@/types/database'

const STAGE_OPTIONS = [
  { value: 'pregnancy', label: '임신' },
  { value: 'birth', label: '출산' },
  { value: 'childcare', label: '육아' },
] as const

const QUALIFICATION_OPTIONS = ['다자녀', '한부모', '장애', '청소년산모', '다태아', '외국인']
const HOUSING_OPTIONS = [
  { value: 'own', label: '자가' },
  { value: 'jeonse', label: '전세' },
  { value: 'monthly_rent', label: '월세' },
  { value: 'none', label: '무주택' },
] as const

const labelCls = 'block text-sm font-medium text-gray-800 mb-1.5'
const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition'
const errorCls = 'mt-1 text-xs text-red-600'
const sectionCls = 'bg-white border border-gray-200 rounded-2xl p-6 space-y-4'

type FieldErrors = Record<string, string>

export default function PolicyForm({
  policy,
  mode,
}: {
  policy?: Policy
  mode: 'new' | 'edit'
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const initRegionMode: 'nationwide' | 'specific' =
    policy && policy.sido_scope.length > 0 ? 'specific' : 'nationwide'

  const [regionMode, setRegionMode] = useState<'nationwide' | 'specific'>(initRegionMode)
  const [pickedSido, setPickedSido] = useState<Sido | ''>(
    (policy?.sido_scope[0] as Sido | undefined) ?? '',
  )
  const [pickedSigungu, setPickedSigungu] = useState<string[]>(
    policy?.sigungu_scope ?? [],
  )
  const [pickedStage, setPickedStage] = useState<string[]>(policy?.target_stage ?? [])
  const [pickedQuals, setPickedQuals] = useState<string[]>(
    policy?.target_qualifications ?? [],
  )
  const [pickedHousing, setPickedHousing] = useState<string[]>(policy?.target_housing ?? [])

  function toggleArray(arr: string[], value: string): string[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const fd = new FormData(e.currentTarget)
    const sido_scope = regionMode === 'specific' && pickedSido ? [pickedSido] : []
    const sigungu_scope = regionMode === 'specific' && pickedSido ? pickedSigungu : []

    const body = {
      title: fd.get('title'),
      summary: fd.get('summary'),
      description: fd.get('description'),
      provider: fd.get('provider'),
      provider_name: fd.get('provider_name'),
      category: fd.get('category'),
      support_type: fd.get('support_type'),
      support_amount: fd.get('support_amount') ? Number(fd.get('support_amount')) : null,
      target_stage: pickedStage,
      target_age_min_months: fd.get('target_age_min_months')
        ? Number(fd.get('target_age_min_months'))
        : null,
      target_age_max_months: fd.get('target_age_max_months')
        ? Number(fd.get('target_age_max_months'))
        : null,
      sido_scope,
      sigungu_scope,
      target_income_max_percentile: fd.get('target_income_max_percentile')
        ? Number(fd.get('target_income_max_percentile'))
        : null,
      target_qualifications: pickedQuals,
      target_housing: pickedHousing,
      apply_start: fd.get('apply_start') || null,
      apply_end: fd.get('apply_end') || null,
      apply_place: fd.get('apply_place') || null,
      apply_method: fd.get('apply_method') || null,
      external_url: fd.get('external_url') || null,
      is_active: fd.get('is_active') === 'on',
    }

    startTransition(async () => {
      try {
        const url =
          mode === 'new'
            ? '/api/admin/policies'
            : `/api/admin/policies/${policy?.id}`
        const res = await fetch(url, {
          method: mode === 'new' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? '저장 실패')
          setFieldErrors(data.fieldErrors ?? {})
          return
        }
        router.push('/admin/policies')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : '네트워크 오류')
      }
    })
  }

  async function handleDelete() {
    if (!policy) return
    if (!confirm('정말 삭제할까요? 되돌릴 수 없어요.')) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/policies/${policy.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? '삭제 실패')
          return
        }
        router.push('/admin/policies')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : '네트워크 오류')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">1. 기본 정보</h2>
        <div>
          <label htmlFor="title" className={labelCls}>
            정책명 *
          </label>
          <input
            id="title"
            name="title"
            defaultValue={policy?.title}
            required
            className={inputCls}
          />
          {fieldErrors.title && <p className={errorCls}>{fieldErrors.title}</p>}
        </div>
        <div>
          <label htmlFor="summary" className={labelCls}>
            한줄 요약 *
          </label>
          <input
            id="summary"
            name="summary"
            defaultValue={policy?.summary}
            required
            className={inputCls}
          />
          {fieldErrors.summary && <p className={errorCls}>{fieldErrors.summary}</p>}
        </div>
        <div>
          <label htmlFor="description" className={labelCls}>
            상세 설명 *
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={policy?.description}
            required
            rows={5}
            className={inputCls}
          />
          {fieldErrors.description && (
            <p className={errorCls}>{fieldErrors.description}</p>
          )}
        </div>
      </div>

      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">2. 분류</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="provider" className={labelCls}>
              공급 주체 *
            </label>
            <select
              id="provider"
              name="provider"
              defaultValue={policy?.provider ?? ''}
              required
              className={inputCls}
            >
              <option value="">선택</option>
              <option value="central">중앙정부</option>
              <option value="sido">시·도</option>
              <option value="sigungu">시·군·구</option>
            </select>
            {fieldErrors.provider && <p className={errorCls}>{fieldErrors.provider}</p>}
          </div>
          <div>
            <label htmlFor="provider_name" className={labelCls}>
              공급 기관명 *
            </label>
            <input
              id="provider_name"
              name="provider_name"
              defaultValue={policy?.provider_name}
              placeholder="예: 보건복지부, 서울특별시, 강남구"
              required
              className={inputCls}
            />
            {fieldErrors.provider_name && (
              <p className={errorCls}>{fieldErrors.provider_name}</p>
            )}
          </div>
          <div>
            <label htmlFor="category" className={labelCls}>
              카테고리 *
            </label>
            <select
              id="category"
              name="category"
              defaultValue={policy?.category ?? ''}
              required
              className={inputCls}
            >
              <option value="">선택</option>
              <option value="pregnancy">임신</option>
              <option value="birth">출산</option>
              <option value="childcare">육아</option>
            </select>
            {fieldErrors.category && <p className={errorCls}>{fieldErrors.category}</p>}
          </div>
          <div>
            <label htmlFor="support_type" className={labelCls}>
              지원 유형 *
            </label>
            <select
              id="support_type"
              name="support_type"
              defaultValue={policy?.support_type ?? ''}
              required
              className={inputCls}
            >
              <option value="">선택</option>
              <option value="cash">현금</option>
              <option value="voucher">바우처</option>
              <option value="service">서비스</option>
            </select>
            {fieldErrors.support_type && (
              <p className={errorCls}>{fieldErrors.support_type}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="support_amount" className={labelCls}>
            지원 금액 (원, 선택)
          </label>
          <input
            id="support_amount"
            name="support_amount"
            type="number"
            min={0}
            defaultValue={policy?.support_amount ?? ''}
            placeholder="예: 1000000"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-gray-500">
            대표 금액. 비워두면 &quot;금액 미정&quot; 또는 &quot;서비스 제공&quot;으로 표시.
          </p>
        </div>
      </div>

      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">3. 대상 시기·연령</h2>
        <fieldset>
          <legend className={labelCls}>대상 시기 * (복수 선택)</legend>
          <div className="grid grid-cols-3 gap-2">
            {STAGE_OPTIONS.map((s) => (
              <label
                key={s.value}
                className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer ${
                  pickedStage.includes(s.value)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={pickedStage.includes(s.value)}
                  onChange={() => setPickedStage((prev) => toggleArray(prev, s.value))}
                  className="accent-emerald-600"
                />
                <span className="text-sm">{s.label}</span>
              </label>
            ))}
          </div>
          {fieldErrors.target_stage && (
            <p className={errorCls}>{fieldErrors.target_stage}</p>
          )}
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="target_age_min_months" className={labelCls}>
              자녀 최소 개월수
            </label>
            <input
              id="target_age_min_months"
              name="target_age_min_months"
              type="number"
              min={0}
              defaultValue={policy?.target_age_min_months ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="target_age_max_months" className={labelCls}>
              자녀 최대 개월수
            </label>
            <input
              id="target_age_max_months"
              name="target_age_max_months"
              type="number"
              min={0}
              defaultValue={policy?.target_age_max_months ?? ''}
              className={inputCls}
            />
            {fieldErrors.target_age_max_months && (
              <p className={errorCls}>{fieldErrors.target_age_max_months}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          예: 만 0세 (0~11), 만 1세 (12~23), 만 8세 미만 (0~95). 임신중 대상이면 비워둬도 됩니다.
        </p>
      </div>

      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">4. 적용 지역</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer flex-1">
            <input
              type="radio"
              name="region_mode"
              checked={regionMode === 'nationwide'}
              onChange={() => setRegionMode('nationwide')}
              className="accent-emerald-600"
            />
            <span className="text-sm">전국</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer flex-1">
            <input
              type="radio"
              name="region_mode"
              checked={regionMode === 'specific'}
              onChange={() => setRegionMode('specific')}
              className="accent-emerald-600"
            />
            <span className="text-sm">특정 지역</span>
          </label>
        </div>

        {regionMode === 'specific' && (
          <>
            <div>
              <label className={labelCls}>시·도</label>
              <select
                value={pickedSido}
                onChange={(e) => {
                  setPickedSido(e.target.value as Sido)
                  setPickedSigungu([])
                }}
                className={inputCls}
              >
                <option value="">선택</option>
                {SIDO_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {pickedSido && (
              <div>
                <label className={labelCls}>
                  시·군·구 (전체 적용이면 모두 비우기)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {SIGUNGU_MAP[pickedSido].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pickedSigungu.includes(g)}
                        onChange={() =>
                          setPickedSigungu((prev) => toggleArray(prev, g))
                        }
                        className="accent-emerald-600"
                      />
                      <span className="text-sm">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">5. 자격 조건 (선택)</h2>
        <div>
          <label htmlFor="target_income_max_percentile" className={labelCls}>
            소득 상한 분위
          </label>
          <select
            id="target_income_max_percentile"
            name="target_income_max_percentile"
            defaultValue={policy?.target_income_max_percentile ?? ''}
            className={inputCls}
          >
            <option value="">제한 없음</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}분위 이하
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={labelCls}>특수 자격 (해당하는 사람만 신청 가능)</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUALIFICATION_OPTIONS.map((q) => (
              <label
                key={q}
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${
                  pickedQuals.includes(q)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={pickedQuals.includes(q)}
                  onChange={() => setPickedQuals((prev) => toggleArray(prev, q))}
                  className="accent-emerald-600"
                />
                <span className="text-sm">{q}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelCls}>주택 보유 조건</legend>
          <div className="grid grid-cols-4 gap-2">
            {HOUSING_OPTIONS.map((h) => (
              <label
                key={h.value}
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${
                  pickedHousing.includes(h.value)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={pickedHousing.includes(h.value)}
                  onChange={() => setPickedHousing((prev) => toggleArray(prev, h.value))}
                  className="accent-emerald-600"
                />
                <span className="text-sm">{h.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">6. 신청</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="apply_start" className={labelCls}>
              신청 시작
            </label>
            <input
              id="apply_start"
              name="apply_start"
              type="date"
              defaultValue={policy?.apply_start ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="apply_end" className={labelCls}>
              신청 마감
            </label>
            <input
              id="apply_end"
              name="apply_end"
              type="date"
              defaultValue={policy?.apply_end ?? ''}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-500">상시 신청이면 비워두기</p>
          </div>
        </div>
        <div>
          <label htmlFor="apply_place" className={labelCls}>
            신청처
          </label>
          <input
            id="apply_place"
            name="apply_place"
            defaultValue={policy?.apply_place ?? ''}
            placeholder="예: 정부24, 주민센터"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="apply_method" className={labelCls}>
            신청 방법
          </label>
          <input
            id="apply_method"
            name="apply_method"
            defaultValue={policy?.apply_method ?? ''}
            placeholder="예: 온라인 또는 방문"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="external_url" className={labelCls}>
            외부 신청 링크
          </label>
          <input
            id="external_url"
            name="external_url"
            type="url"
            defaultValue={policy?.external_url ?? ''}
            placeholder="https://..."
            className={inputCls}
          />
          {fieldErrors.external_url && (
            <p className={errorCls}>{fieldErrors.external_url}</p>
          )}
        </div>
      </div>

      <div className={sectionCls}>
        <h2 className="text-base font-semibold text-gray-900">7. 상태</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={policy?.is_active ?? true}
            className="w-4 h-4 accent-emerald-600"
          />
          <div>
            <p className="text-sm font-medium">활성</p>
            <p className="text-xs text-gray-500">
              체크 해제하면 정책 둘러보기와 매칭에서 빠집니다.
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3 sticky bottom-0 bg-gray-50 -mx-6 px-6 py-3 border-t border-gray-200">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition"
        >
          {pending ? '저장 중...' : mode === 'new' ? '정책 등록' : '수정 저장'}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  )
}
