import { useState } from 'react'
import Markdown from './Markdown'
import AiSprout from './AiSprout'
import ManualNode from './ManualNode'

const STATUS_LABEL = {
  completed: { text: '개화 완료', cls: 'text-gold-600 border-gold-500/60 bg-gold-400/10' },
  available: { text: '수련 가능', cls: 'text-ember border-ember/50 bg-ember/10' },
  locked: { text: '고대 봉인', cls: 'text-sealed border-sealed/40 bg-sealed/10' },
}

function QuestItem({ item, disabled, onToggle }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(item.id)}
      className={`group flex w-full items-center gap-3 rounded-lg border border-grim-700/15 bg-grim-900/[0.03] px-3 py-2.5 text-left transition ${
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-gold-500/50 hover:bg-gold-400/5'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
          item.done
            ? 'border-gold-500 bg-gradient-to-br from-gold-400 to-gold-600 text-grim-900'
            : 'border-ink-soft/50 bg-transparent'
        }`}
      >
        {item.done && (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span
        className={`text-[13px] ${item.done ? 'text-ink-soft line-through' : 'text-ink'}`}
      >
        {item.text}
      </span>
    </button>
  )
}

function Journal({ node, status, onToggle, onComplete, onDelete }) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center text-ink-soft">
        <div className="mb-3 text-4xl opacity-60">✧</div>
        <p className="font-display text-[15px] text-grim-700">
          수련의 룬을 지목하십시오
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed">
          좌측 지도에서 노드를 누르면 그 비술의 요약과
          <br />
          완수해야 할 길드 퀘스트가 이 자리에 펼쳐집니다.
        </p>
      </div>
    )
  }

  const badge = STATUS_LABEL[status]
  const doneCount = node.checklist.filter((c) => c.done).length
  const locked = status === 'locked'

  return (
    <div key={node.id} className="fade-up flex h-full flex-col">
      <div className="thin-scroll flex-1 overflow-y-auto px-6 py-5">
        {/* 표제 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[11px] tracking-[0.2em] text-gold-600">
              {node.grade}
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-grim-800">
              {node.title}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">{node.tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-1 font-display text-[10px] tracking-widest ${badge.cls}`}
            >
              {badge.text}
            </span>
            <button
              type="button"
              title="이 수련 삭제"
              onClick={() => onDelete?.(node.id)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-ember/40 text-ember/80 transition hover:border-ember hover:bg-ember/10 hover:text-ember"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
              </svg>
            </button>
          </div>
        </div>

        <div className="rune-divider my-4" />

        {/* 요약본 */}
        <div className="mb-1.5 flex items-center gap-2 font-display text-[12px] tracking-widest text-gold-600">
          <span>📜</span> 전승 수련 요약본
        </div>
        <div className="rounded-xl border border-grim-700/15 bg-grim-900/[0.04] px-4 py-3">
          <Markdown text={node.summary} />
        </div>

        {/* 퀘스트 */}
        <div className="mt-5 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-[12px] tracking-widest text-gold-600">
            <span>⚔️</span> 완수해야 할 길드 퀘스트
          </div>
          <span className="font-display text-[11px] text-ink-soft">
            {doneCount} / {node.checklist.length} 완료
          </span>
        </div>
        <div className="space-y-2">
          {node.checklist.map((item) => (
            <QuestItem key={item.id} item={item} disabled={locked} onToggle={onToggle} />
          ))}
        </div>

        {locked && (
          <p className="mt-4 rounded-lg border border-sealed/30 bg-sealed/5 px-3 py-2 text-center text-[12px] text-ink-soft">
            🔒 선행 수련을 먼저 완성해야 이 봉인이 풀립니다.
          </p>
        )}
      </div>

      {/* 개화 버튼 */}
      {!locked && (
        <div className="border-t border-gold-600/25 bg-grim-900/[0.03] px-6 py-3">
          <button
            type="button"
            onClick={() => onComplete(node.id)}
            disabled={status === 'completed'}
            className={`w-full rounded-lg py-3 font-display text-[14px] font-bold tracking-wide transition ${
              status === 'completed'
                ? 'cursor-default border border-gold-500/40 bg-gold-400/10 text-gold-600'
                : 'bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 text-grim-900 shadow-[0_4px_16px_-4px_rgba(212,175,71,0.6)] hover:brightness-110'
            }`}
          >
            {status === 'completed' ? '✦ 이미 만개한 비술 ✦' : '즉각 연금술 개화 (0.8초 폭발 테스트)'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DetailPanel({
  node,
  status,
  onToggle,
  onComplete,
  onDelete,
  onCollapse,
  existing,
  onCreateNodes,
}) {
  const [tab, setTab] = useState('journal')

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold-600/35 bg-parchment shadow-[0_0_40px_-8px_rgba(0,0,0,0.6)]">
      {/* 탭 */}
      <div className="flex gap-1 border-b border-grim-700/15 bg-grim-900/[0.04] p-1.5">
        {[
          { id: 'journal', label: '📖  일지' },
          { id: 'manual', label: '✒️  새기기' },
          { id: 'ai', label: '🌱  현자 AI' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 font-display text-[12.5px] font-semibold tracking-wide transition ${
              tab === t.id
                ? 'bg-gradient-to-b from-grim-600 to-grim-700 text-gold-200 shadow'
                : 'text-ink-soft hover:bg-grim-900/[0.04]'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onCollapse}
          title="수련서 접기"
          className="flex w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-grim-900/[0.06] hover:text-grim-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 6l6 6-6 6M5 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'journal' && (
          <Journal
            node={node}
            status={status}
            onToggle={onToggle}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        )}
        {tab === 'manual' && <ManualNode existing={existing} onCreateNodes={onCreateNodes} />}
        {tab === 'ai' && <AiSprout existing={existing} onCreateNodes={onCreateNodes} />}
      </div>
    </aside>
  )
}
