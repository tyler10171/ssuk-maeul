'use client'

import { useActionState, useState } from 'react'
import { SIDO_LIST, SIGUNGU_MAP, type Sido } from '@/lib/korean-regions'
import { completeOnboarding, initialOnboardingState } from './actions'

const STAGE_OPTIONS = [
  { value: 'pregnancy', label: '임신 중', hint: '출산예정일을 입력해주세요' },
  { value: 'birth', label: '출산 직후', hint: '아이 생년월일을 입력해주세요' },
  { value: 'childcare', label: '육아 중', hint: '아이 생년월일을 입력해주세요' },
] as const

const HOUSING_OPTIONS = [
  { value: 'own', label: '자가' },
  { value: 'jeonse', label: '전세' },
  { value: 'monthly_rent', label: '월세' },
  { value: 'none', label: '무주택' },
] as const

const QUALIFICATION_OPTIONS = [
  { value: '다자녀', desc: '자녀 2명 이상' },
  { value: '한부모', desc: '한부모 가족' },
  { value: '장애', desc: '자녀가 장애 등록' },
  { value: '청소년산모', desc: '만 19세 이하 산모' },
  { value: '다태아', desc: '쌍둥이·다태아' },
  { value: '외국인', desc: '외국인 가정' },
] as const

const labelCls = 'block text-sm font-medium text-gray-800 mb-1.5'
const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-400'
const errorCls = 'mt-1 text-xs text-red-600'

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialOnboardingState,
  )
  const [sido, setSido] = useState<Sido | ''>('')
  const [stage, setStage] = useState<string>('')

  const sigunguOptions = sido ? SIGUNGU_MAP[sido] : []

  return (
    <form action={formAction} className="space-y-10">
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
          1. 기본 정보
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sido" className={labelCls}>
              시·도 <span className="text-emerald-600">*</span>
            </label>
            <select
              id="sido"
              name="sido"
              required
              value={sido}
              onChange={(e) => setSido(e.target.value as Sido)}
              className={inputCls}
            >
              <option value="">선택해주세요</option>
              {SIDO_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {state.fieldErrors?.sido && <p className={errorCls}>{state.fieldErrors.sido}</p>}
          </div>

          <div>
            <label htmlFor="sigungu" className={labelCls}>
              시·군·구 <span className="text-emerald-600">*</span>
            </label>
            <select
              id="sigungu"
              name="sigungu"
              required
              disabled={!sido}
              className={inputCls}
              defaultValue=""
            >
              <option value="">{sido ? '선택해주세요' : '시·도 먼저 선택'}</option>
              {sigunguOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {state.fieldErrors?.sigungu && (
              <p className={errorCls}>{state.fieldErrors.sigungu}</p>
            )}
          </div>
        </div>

        <fieldset>
          <legend className={labelCls}>
            현재 시기 <span className="text-emerald-600">*</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {STAGE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col p-3 border rounded-lg cursor-pointer transition ${
                  stage === opt.value
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="current_stage"
                    value={opt.value}
                    onChange={(e) => setStage(e.target.value)}
                    className="accent-emerald-600"
                    required
                  />
                  <span className="font-medium">{opt.label}</span>
                </span>
                <span className="text-xs text-gray-500 mt-1 ml-6">{opt.hint}</span>
              </label>
            ))}
          </div>
          {state.fieldErrors?.current_stage && (
            <p className={errorCls}>{state.fieldErrors.current_stage}</p>
          )}
        </fieldset>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
          2. 자녀 정보
        </h2>

        {stage === 'pregnancy' && (
          <div>
            <label htmlFor="due_date" className={labelCls}>
              출산예정일 <span className="text-emerald-600">*</span>
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              required
              className={inputCls}
            />
            {state.fieldErrors?.due_date && (
              <p className={errorCls}>{state.fieldErrors.due_date}</p>
            )}
          </div>
        )}

        {(stage === 'birth' || stage === 'childcare') && (
          <div>
            <label htmlFor="birth_date" className={labelCls}>
              생년월일 <span className="text-emerald-600">*</span>
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              required
              className={inputCls}
            />
            {state.fieldErrors?.birth_date && (
              <p className={errorCls}>{state.fieldErrors.birth_date}</p>
            )}
          </div>
        )}

        {!stage && (
          <p className="text-sm text-gray-500 italic">현재 시기를 먼저 선택해주세요</p>
        )}

        <div>
          <label htmlFor="nickname" className={labelCls}>
            별칭 <span className="text-xs font-normal text-gray-500">(선택)</span>
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            maxLength={20}
            placeholder="예: 쑥쑥이"
            className={inputCls}
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
          3. 추가 정보{' '}
          <span className="text-xs font-normal text-gray-500">
            (선택 · 매칭 정확도가 올라가요)
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="income_percentile" className={labelCls}>
              소득 분위
            </label>
            <select
              id="income_percentile"
              name="income_percentile"
              className={inputCls}
              defaultValue=""
            >
              <option value="">선택 안 함</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}분위
                </option>
              ))}
            </select>
            {state.fieldErrors?.income_percentile && (
              <p className={errorCls}>{state.fieldErrors.income_percentile}</p>
            )}
          </div>

          <div>
            <label htmlFor="household_size" className={labelCls}>
              가구원 수
            </label>
            <select
              id="household_size"
              name="household_size"
              className={inputCls}
              defaultValue=""
            >
              <option value="">선택 안 함</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
            {state.fieldErrors?.household_size && (
              <p className={errorCls}>{state.fieldErrors.household_size}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="monthly_income" className={labelCls}>
            월 가구 소득 <span className="text-xs font-normal text-gray-500">(만원, 선택)</span>
          </label>
          <input
            id="monthly_income"
            name="monthly_income"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="예: 500"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-gray-500">
            가구 합산 월 소득. 소득 기준 정책 매칭에만 사용돼요.
          </p>
          {state.fieldErrors?.monthly_income && (
            <p className={errorCls}>{state.fieldErrors.monthly_income}</p>
          )}
        </div>

        <fieldset>
          <legend className={labelCls}>주택 보유 상태</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {HOUSING_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="housing_status"
                  value={opt.value}
                  className="accent-emerald-600"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelCls}>
            해당하는 자격 <span className="text-xs font-normal text-gray-500">(중복 가능)</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUALIFICATION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-2 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  name="qualifications"
                  value={opt.value}
                  className="mt-0.5 accent-emerald-600"
                />
                <span className="text-sm">
                  <span className="font-medium">{opt.value}</span>
                  <span className="block text-xs text-gray-500">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white border-t border-gray-100 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0">
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition"
        >
          {pending ? '저장 중...' : '저장하고 추천 보기'}
        </button>
      </div>
    </form>
  )
}
