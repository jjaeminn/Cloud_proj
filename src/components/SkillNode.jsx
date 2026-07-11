import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import Lotus from './Lotus'

/*
  수련의 룬(노드). data 로 status·selected·justBloomed 를 받아
  세 가지 얼굴을 보여준다:
    completed → 만개한 황금 로터스
    available → 맥동하는 마력의 구슬
    locked    → 고대의 봉인 (자물쇠)

  memo 로 감싼다 — SkillTree 가 data 객체의 참조 동일성을 지켜주므로,
  옮기거나 고른 노드 하나만 다시 그려진다.
*/
function SkillNode({ data }) {
  const { title, grade, tagline, status, selected, justBloomed, onDelete } = data

  /* transition-all 은 box-shadow·outline 까지 감시해 비싸다 → 필요한 것만 */
  const base =
    'group relative w-[210px] rounded-xl px-4 py-3 transition-[border-color,opacity] duration-300 cursor-grab active:cursor-grabbing select-none border'

  const skin = {
    completed:
      'bg-gradient-to-br from-grim-700 to-grim-800 border-gold-400/80 shadow-[0_0_22px_-4px_rgba(212,175,71,0.55)]',
    available:
      'bg-gradient-to-br from-grim-600 to-grim-800 border-gold-500/70 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.7)]',
    locked:
      'bg-gradient-to-br from-grim-800 to-grim-900 border-sealed/40 opacity-70 grayscale-[35%]',
  }[status]

  const ring = selected
    ? 'outline outline-2 outline-gold-300 outline-offset-2'
    : ''

  return (
    <div className={`${base} ${skin} ${ring}`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* 삭제 룬 — 노드에 커서를 올리면 나타난다 */}
      <button
        type="button"
        title="이 수련 삭제"
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
        className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-ember/60 bg-grim-900 text-parchment/80 opacity-0 shadow transition group-hover:opacity-100 hover:bg-ember hover:text-grim-900"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* 상태 아이콘 */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          {status === 'completed' && <Lotus size={46} burst={justBloomed} />}

          {status === 'available' && (
            /* 발광은 별도 레이어의 opacity/transform 으로만 — box-shadow 애니는 매 프레임 repaint */
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span
                aria-hidden
                className="orb-glow absolute inset-0 rounded-full bg-lotus/70 blur-md"
              />
              <span className="orb-pulse relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lotus to-ember">
                <span className="h-3 w-3 rounded-full bg-gold-100" />
              </span>
            </span>
          )}

          {status === 'locked' && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-sealed/60 bg-grim-900/70 text-sealed">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div
            className={`font-display text-[10px] tracking-[0.18em] ${
              status === 'locked' ? 'text-sealed' : 'text-gold-400'
            }`}
          >
            {grade}
          </div>
          <div
            className={`truncate font-display text-[15px] font-bold ${
              status === 'locked' ? 'text-parchment/50' : 'text-parchment'
            }`}
          >
            {title}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-ink-soft/90 text-parchment/45">
            {tagline}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(SkillNode)
