import { useState } from 'react'

/*
  직접 새기기 — 폼으로 노드를 손수 만든다 (AI 없이).
  제목·강·부제·요약·체크리스트·선행 수련을 입력하면 onCreateNodes 로 트리에 심긴다.
  드래그로도 선행을 이을 수 있지만, 여기선 만들면서 바로 선행을 고를 수 있다.
*/
export default function ManualNode({ existing = [], onCreateNodes }) {
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState('')
  const [tagline, setTagline] = useState('')
  const [summary, setSummary] = useState('')
  const [checks, setChecks] = useState(['', ''])
  const [prereqs, setPrereqs] = useState([]) // 선택된 기존 노드 id
  const [done, setDone] = useState(null)

  const setCheck = (i, v) => setChecks((cur) => cur.map((c, idx) => (idx === i ? v : c)))
  const addCheck = () => setChecks((cur) => [...cur, ''])
  const removeCheck = (i) => setChecks((cur) => cur.filter((_, idx) => idx !== i))
  const togglePrereq = (id) =>
    setPrereqs((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]))

  const canSubmit = title.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const draft = {
      manual: true,
      title: title.trim(),
      grade: grade.trim() || '직접 · 수련',
      tagline: tagline.trim() || '손수 새긴 나만의 수련',
      summary: summary.trim() || `# ${title.trim()}`,
      checklist: checks.map((c) => c.trim()).filter(Boolean),
      prerequisites: prereqs,
    }
    const ids = onCreateNodes?.([draft]) || []
    setDone({ title: draft.title, id: ids[0] })
    setTitle('')
    setGrade('')
    setTagline('')
    setSummary('')
    setChecks(['', ''])
    setPrereqs([])
  }

  const field =
    'w-full rounded-lg border border-grim-700/20 bg-grim-900/[0.03] px-3 py-2 text-[13px] text-ink placeholder:text-ink-soft/50 focus:border-gold-500/60 focus:outline-none'

  return (
    <div className="thin-scroll flex h-full flex-col overflow-y-auto px-6 py-5">
      <div className="mb-1 font-display text-[15px] font-extrabold text-grim-800">
        수련을 직접 새기다
      </div>
      <p className="mb-3 text-[12px] leading-relaxed text-ink-soft">
        AI 없이 손수 노드를 만든다. 선행 수련을 골라 사슬에 잇거나, 심은 뒤 지도에서 노드
        우측 점을 끌어 직접 연결해도 된다.
      </p>

      <label className="mb-1 block font-display text-[11px] tracking-widest text-gold-600">제목 *</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="예: 도커 컨테이너"
        className={field}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block font-display text-[11px] tracking-widest text-gold-600">강(등급)</label>
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="직접 · 수련"
            className={field}
          />
        </div>
        <div>
          <label className="mb-1 block font-display text-[11px] tracking-widest text-gold-600">부제</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="한 줄 설명"
            className={field}
          />
        </div>
      </div>

      <label className="mb-1 mt-3 block font-display text-[11px] tracking-widest text-gold-600">
        요약 (마크다운)
      </label>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder={'# 제목\n\n- 핵심 개념\n- **굵게** · `코드`'}
        className={`${field} h-52 shrink-0 resize-y font-serif text-[13.5px] leading-relaxed`}
      />

      {/* 체크리스트 */}
      <div className="mb-1 mt-3 flex items-center justify-between">
        <label className="font-display text-[11px] tracking-widest text-gold-600">퀘스트 체크리스트</label>
        <button
          type="button"
          onClick={addCheck}
          className="rounded-md border border-gold-600/40 px-2 py-0.5 text-[11px] text-gold-600 hover:bg-gold-400/10"
        >
          + 추가
        </button>
      </div>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-gold-500">✦</span>
            <input
              value={c}
              onChange={(e) => setCheck(i, e.target.value)}
              placeholder={`과제 ${i + 1}`}
              className={field}
            />
            {checks.length > 1 && (
              <button
                type="button"
                onClick={() => removeCheck(i)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ember/70 hover:bg-ember/10"
                title="제거"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 선행 수련 선택 */}
      {existing.length > 0 && (
        <>
          <label className="mb-1.5 mt-3 block font-display text-[11px] tracking-widest text-gold-600">
            선행 수련 (이 노드 앞에 와야 할 것)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {existing.map((n) => {
              const on = prereqs.includes(n.id)
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => togglePrereq(n.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    on
                      ? 'border-gold-500 bg-gold-400/15 text-gold-700'
                      : 'border-grim-700/25 text-ink-soft hover:border-gold-500/50'
                  }`}
                >
                  {on ? '✓ ' : ''}
                  {n.title}
                </button>
              )
            })}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 py-2.5 font-display text-[14px] font-bold tracking-wide text-grim-900 shadow transition hover:brightness-110 disabled:opacity-50"
      >
        ✒️ 지도에 새기기
      </button>

      {done && (
        <div className="fade-up mt-4 rounded-xl border border-gold-500/60 bg-gold-400/[0.08] p-4">
          <div className="flex items-center gap-2 font-display text-[13px] font-bold text-grim-800">
            <span>🪷</span> 「{done.title}」 수련이 지도에 새겨졌습니다!
          </div>
          <p className="mt-1 text-[12px] text-ink-soft">
            좌측 지도에서 선택되어 있습니다. 노드 우측 점을 끌면 다른 노드와 직접 연결할 수 있어요.
          </p>
        </div>
      )}
    </div>
  )
}
