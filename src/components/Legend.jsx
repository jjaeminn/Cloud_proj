/* 지도 하단 범례 — 세 가지 봉인 상태의 뜻풀이 */
const ITEMS = [
  { icon: '🪷', label: '황금 로터스 만개 (완료)' },
  { icon: '🔆', label: '도전 가능한 수련' },
  { icon: '🔒', label: '고대 봉인 상태 (선행 필요)' },
]

export default function Legend() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 border-t border-gold-600/25 bg-grim-900/95 px-5 py-2 text-[11px]">
      <div className="flex items-center gap-5">
        {ITEMS.map((it) => (
          <div key={it.label} className="flex items-center gap-1.5 text-parchment/70">
            <span>{it.icon}</span>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <p className="hidden text-parchment/40 italic md:block">
        ※ 비밀의 주문은 이전 수련을 완전히 마무리했을 때 영롱하게 깨어납니다.
      </p>
    </div>
  )
}
