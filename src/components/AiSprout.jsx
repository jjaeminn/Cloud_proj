import { useState } from 'react'

/*
  현자의 가지심기 — 학습 노트를 붙여 넣으면 현자(LLM)가 요약하고
  '여러 단계의 수련 노드'로 쪼개어 1→2→3 사슬(트리)로 심는다.

  1) /api/summarize (Express + LLM 프록시)를 먼저 부른다. → { nodes: [...] }
  2) 프록시가 없거나 키가 없으면 → 로컬 목업으로 대체하고 알린다.
  성공하면 onCreateNodes 로 트리에 심고, 사슬의 뿌리 노드를 선택 상태로 옮긴다.
*/
function mockSprout(text) {
  // '#' 제목 단위로 섹션을 쪼개 사슬로 엮는다 (프록시 없이도 구조화 흉내)
  const sections = text
    .split(/\n(?=#\s)/)
    .map((s) => s.trim())
    .filter(Boolean)
  const blocks = sections.length ? sections : [text]

  return blocks.slice(0, 6).map((sec, i) => {
    const lines = sec.split('\n').map((l) => l.trim()).filter(Boolean)
    const title = (lines[0] || `수련 ${i + 1}`).replace(/^#+\s*/, '').slice(0, 24)
    const checklist = lines
      .slice(1)
      .filter((l) => /^[-*•]/.test(l))
      .slice(0, 4)
      .map((l) => l.replace(/^[-*•]\s*/, ''))
    return {
      key: `m${i}`,
      title,
      grade: 'AI 강 · 가지심기',
      tagline: '현자가 틔운 새로운 수련 가지',
      summary: `# ${title}\n\n${lines.slice(1, 4).join('\n')}`,
      checklist: checklist.length ? checklist : ['핵심 개념 정리', '실습으로 검증'],
      prerequisites: i > 0 ? [`m${i - 1}`] : [],
    }
  })
}

async function askSage(notes, existing) {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, existing }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `요청 실패 (${res.status})`)
    err.code = body.error
    throw err
  }
  const data = await res.json()
  // 서버는 { nodes: [...] } 를 준다. 혹시 단일 노드로 오면 배열로 감싼다.
  return Array.isArray(data?.nodes) ? data.nodes : [data]
}

export default function AiSprout({ existing = [], onCreateNodes }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null) // { titles: [], viaMock }
  const [error, setError] = useState('')

  const handleSprout = async () => {
    if (!text.trim() || busy) return
    setBusy(true)
    setError('')
    setResult(null)

    let drafts
    let viaMock = false
    try {
      drafts = await askSage(text.trim(), existing)
    } catch (e) {
      viaMock = true
      drafts = mockSprout(text)
      setError(
        e.code === 'NO_KEY'
          ? '현자(LLM)가 아직 연결되지 않아 로컬 목업으로 심었습니다. .env 에 GEMINI_API_KEY 를 넣고 `npm run server` 를 켜면 실제 요약이 됩니다.'
          : `현자와 통신하지 못해 로컬 목업으로 심었습니다. (${e.message})`,
      )
    }

    const ids = onCreateNodes?.(drafts) || []
    setResult({ titles: drafts.map((d) => d.title), count: ids.length, viaMock })
    setText('')
    setBusy(false)
  }

  return (
    <div className="thin-scroll flex h-full flex-col overflow-y-auto px-6 py-5">
      <div className="mb-1 font-display text-[15px] font-extrabold text-grim-800">
        현자에게 지식을 바치다
      </div>
      <p className="mb-3 text-[12px] leading-relaxed text-ink-soft">
        오늘 공부한 강의 노트를 아래 두루마리에 옮겨 적으십시오. 현자가 그 뜻을
        요약하고, 배우는 순서에 따라 <b>여러 단계의 수련 가지</b>로 쪼개어 지도 위에
        사슬로 틔워 드립니다.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'# 오늘의 주제\n- 배운 개념 1\n- 배운 개념 2\n\n자유롭게 붙여 넣으세요…'}
        className="h-40 w-full resize-none rounded-xl border border-grim-700/20 bg-grim-900/[0.03] px-3.5 py-3 font-serif text-[13px] leading-relaxed text-ink placeholder:text-ink-soft/50 focus:border-gold-500/60 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleSprout}
        disabled={busy || !text.trim()}
        className="mt-3 w-full rounded-lg bg-gradient-to-r from-grim-600 to-grim-700 py-2.5 font-display text-[13px] font-bold tracking-wide text-gold-200 shadow transition hover:brightness-110 disabled:opacity-50"
      >
        {busy ? '현자가 사유하는 중…' : '🌱  지식의 가지 심기'}
      </button>

      {result && (
        <div className="fade-up mt-4 rounded-xl border border-gold-500/60 bg-gold-400/[0.08] p-4">
          <div className="flex items-center gap-2 font-display text-[13px] font-bold text-grim-800">
            <span>🪷</span> {result.count}개의 수련 가지가 사슬로 심겼습니다!
          </div>
          <ol className="mt-2 space-y-1">
            {result.titles.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-ink">
                <span className="font-display text-gold-600">{i + 1}.</span>
                {t}
                {i < result.titles.length - 1 && <span className="text-ink-soft">→</span>}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] text-ink-soft">
            좌측 지도에 사슬이 나타났고, 뿌리 노드가 선택되어 있습니다.
          </p>
          {result.viaMock && (
            <span className="mt-2 inline-block rounded-full border border-ember/40 bg-ember/10 px-2 py-0.5 text-[10px] text-ember">
              로컬 목업으로 생성됨
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-ember/30 bg-ember/[0.07] px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
          <span>ⓘ</span>
          <span>{error}</span>
        </div>
      )}

      {!result && !error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-gold-600/25 bg-gold-400/[0.06] px-3 py-2 text-[11px] text-ink-soft">
          <span>ⓘ</span>
          <span>
            <code className="font-mono">npm run server</code> 로 현자의 프록시를 켜면 실제 LLM
            요약이, 꺼져 있으면 로컬 목업이 동작합니다.
          </span>
        </div>
      )}
    </div>
  )
}
