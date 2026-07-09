import { Link } from 'react-router-dom'

/* 상단 표제 — 서명(書名) · 판본 · 학기 숙련도 */
export default function Header({ stats }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-gold-600/30 bg-grim-900/70 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          title="소개 페이지로"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-500/50 bg-grim-700 transition hover:border-gold-400 hover:bg-grim-600"
        >
          <img src="/grimoire.svg" alt="소개로 돌아가기" className="h-8 w-8" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-extrabold tracking-wide text-gold-300">
              고대 마법서: 대현자의 수련지도
            </h1>
            <span className="rounded border border-gold-500/50 px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-widest text-gold-400">
              GRIMOIRE v2.2
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-parchment/55">
            학기 지식의 비술을 완수하여 진정한 대마도사로 거듭나십시오.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-display text-[10px] tracking-[0.18em] text-parchment/50">
            현자의 숙련도 · 지식 화전
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="font-display text-lg font-bold text-gold-300">
              {stats.pct}%
            </span>
            <span className="text-[11px] text-parchment/55">
              ({stats.done} / {stats.total} 비술)
            </span>
          </div>
          <div className="mt-1 h-2 w-56 overflow-hidden rounded-full border border-gold-600/40 bg-grim-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-lotus transition-[width] duration-700 ease-out"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/50 bg-grim-700 text-2xl">
          👑
        </div>
      </div>
    </header>
  )
}
