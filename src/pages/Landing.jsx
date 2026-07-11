import { Link } from 'react-router-dom'
import Lotus from '../components/Lotus'

const FEATURES = [
  {
    icon: '🗺️',
    title: '지식의 스킬트리',
    desc: 'React Flow 로 개념을 노드 트리로 펼친다. 줌·팬·선행관계가 한눈에 흐른다.',
  },
  {
    icon: '🌱',
    title: '현자의 가지심기 (AI)',
    desc: '학습 노트를 붙여 넣으면 LLM 이 배우는 순서대로 여러 단계로 쪼개어 1→2→3 사슬로 자동 구조화한다.',
  },
  {
    icon: '✒️',
    title: '직접 새기기',
    desc: 'AI 없이도 폼으로 제목·요약·체크리스트·선행을 입력해 나만의 수련 노드를 손수 만든다.',
  },
  {
    icon: '🔗',
    title: '드래그로 연결',
    desc: '노드 우측 점을 끌어 다른 노드에 이으면 선행관계가 생긴다. 연결선을 클릭하면 끊긴다.',
  },
  {
    icon: '✋',
    title: '자유 배치',
    desc: '노드를 끌어 원하는 곳에 두고, 좌클릭 박스로 여럿을 골라 함께 옮긴다. 위치는 그대로 저장된다.',
  },
  {
    icon: '🪷',
    title: '황금 로터스 개화',
    desc: '노드의 퀘스트를 모두 완수하면 그 자리에서 로터스가 피어나는 완료 연출이 터진다.',
  },
  {
    icon: '✅',
    title: '퀘스트 체크리스트',
    desc: '노드마다 구체적 실습 과제. 진행·배치·연결이 localStorage 에 영구 저장되어 새로고침해도 남는다.',
  },
  {
    icon: '📜',
    title: '전승 요약본',
    desc: '각 노드를 누르면 마크다운으로 정리된 공부 글이 수련서 패널에 펼쳐진다. 패널은 접었다 펼 수 있다.',
  },
  {
    icon: '✕',
    title: '노드 관리',
    desc: '필요 없는 수련은 지도에서 삭제. AI 가 심은 가지도, 기본 커리큘럼도 자유롭게 정리한다.',
  },
]

const STACK = [
  { name: 'Vite + React', role: '프론트 뼈대' },
  { name: 'Tailwind CSS v4', role: '스타일' },
  { name: 'React Flow', role: '스킬트리 · 드래그 · 연결' },
  { name: 'React Router', role: '페이지 라우팅' },
  { name: 'CSS @keyframes', role: '개화 애니메이션' },
  { name: 'localStorage', role: '진행·배치·연결 저장' },
  { name: 'Express + Gemini', role: 'AI 요약 프록시' },
]

const STEPS = [
  {
    n: 1,
    title: '노트를 바친다',
    desc: '오늘 배운 내용을 두루마리(텍스트)에 그대로 옮겨 적는다.',
  },
  {
    n: 2,
    title: '현자가 분해한다',
    desc: 'LLM(Gemini)이 뜻을 요약하고, 배우는 순서에 따라 여러 노드로 쪼개어 선행관계를 엮는다.',
  },
  {
    n: 3,
    title: '지도에 심긴다',
    desc: '사슬이 트리에 자동 배치되고, 퀘스트를 완수하면 황금 로터스로 개화한다.',
  },
]

function EnterButton({ className = '' }) {
  return (
    <Link
      to="/map"
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 px-7 py-3 font-display text-[15px] font-bold tracking-wide text-grim-900 shadow-[0_6px_24px_-6px_rgba(212,175,71,0.7)] transition hover:brightness-110 ${className}`}
    >
      수련지도 펼치기
      <span aria-hidden>→</span>
    </Link>
  )
}

export default function Landing() {
  return (
    <div className="thin-scroll h-screen overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-14">
        {/* ── Hero ─────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-5">
            <Lotus size={72} />
          </div>
          <span className="rounded-full border border-gold-500/50 px-3 py-1 font-display text-[11px] font-semibold tracking-[0.25em] text-gold-400">
            GRIMOIRE v2.2
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-wide text-gold-300 sm:text-5xl">
            고대 마법서: 대현자의 수련지도
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-parchment/70">
            학습 노트를 바치면 현자가 요약해 <b className="text-gold-300">지식의 스킬트리</b>로 펼쳐 준다.
            노드는 곧 <b>퀘스트</b>, 노드의 속살은 <b>공부 정리</b>, 완수의 순간엔 <b>황금 로터스</b>가 피어난다.
            한 학기의 지식을 게임처럼 정복하라.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <EnterButton />
            <a
              href="#how"
              className="font-display text-[13px] tracking-wide text-parchment/60 underline-offset-4 hover:text-gold-300 hover:underline"
            >
              작동 원리 보기
            </a>
          </div>
        </header>

        <div className="rune-divider my-16" />

        {/* ── Features ─────────────────────────── */}
        <section>
          <h2 className="text-center font-display text-2xl font-bold text-gold-300">✦ 핵심 기능</h2>
          <p className="mt-2 text-center text-[13px] text-parchment/55">
            TODO 앱이 아니라, 자라나는 「내 지식의 지도」
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gold-600/25 bg-grim-800/60 p-5 transition hover:-translate-y-0.5 hover:border-gold-500/60 hover:bg-grim-700/60"
              >
                <div className="mb-2 text-2xl">{f.icon}</div>
                <h3 className="font-display text-[15px] font-bold text-gold-200">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-parchment/65">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* 노드를 심는 세 가지 길 + 마우스 조작 안내 */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gold-500/40 bg-grim-900/50 p-5">
              <div className="font-display text-[13px] tracking-widest text-gold-400">✦ 노드를 심는 세 가지 길</div>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-parchment/70">
                <li>🌱 <b className="text-gold-200">현자(AI)</b> — 노트를 던지면 단계별 사슬로 자동 분해</li>
                <li>✒️ <b className="text-gold-200">직접 새기기</b> — 폼으로 손수 노드 생성</li>
                <li>🔗 <b className="text-gold-200">드래그 연결</b> — 점을 끌어 선행관계 잇기</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gold-500/40 bg-grim-900/50 p-5">
              <div className="font-display text-[13px] tracking-widest text-gold-400">✦ 마우스 조작</div>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-parchment/70">
                <li>🖱️ <b className="text-gold-200">좌클릭 드래그</b> — 노드 이동 · 빈 곳은 범위 선택</li>
                <li>🖱️ <b className="text-gold-200">우클릭 드래그</b> — 지도 화면 이동(팬)</li>
                <li>🖱️ <b className="text-gold-200">노드/선 클릭</b> — 기록 열기 · 연결선 끊기</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="rune-divider my-16" />

        {/* ── How it works ─────────────────────── */}
        <section id="how" className="scroll-mt-8">
          <h2 className="text-center font-display text-2xl font-bold text-gold-300">
            ✦ 작동 원리 — 현자(AI)의 길
          </h2>
          <p className="mt-2 text-center text-[13px] text-parchment/55">
            노트 한 조각이 트리로 자라기까지, 세 번의 술식 (직접·연결로도 만들 수 있다)
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-gold-600/25 bg-grim-800/60 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/50 bg-grim-900 font-display text-lg font-bold text-gold-300">
                  {s.n}
                </div>
                <h3 className="mt-3 font-display text-[15px] font-bold text-gold-200">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-parchment/65">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <span className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 font-display text-2xl text-gold-500/70 md:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-gold-600/20 bg-grim-900/50 px-5 py-3 text-center text-[12px] text-parchment/55">
            데이터 한 조각의 모양 —
            <code className="mx-1 rounded bg-grim-700 px-1.5 py-0.5 font-mono text-gold-300">
              요약 · 트리 위치 · 체크리스트
            </code>
            가 한 노드에 담기고, <code className="mx-1 rounded bg-grim-700 px-1.5 py-0.5 font-mono text-gold-300">prerequisites</code>
            가 곧 엣지가 된다.
          </div>
        </section>

        <div className="rune-divider my-16" />

        {/* ── Tech stack ───────────────────────── */}
        <section>
          <h2 className="text-center font-display text-2xl font-bold text-gold-300">✦ 사용 기술 스택</h2>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
            {STACK.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-gold-600/30 bg-grim-800/60 px-4 py-2.5 text-center"
              >
                <div className="font-display text-[13px] font-bold text-gold-200">{t.name}</div>
                <div className="text-[11px] text-parchment/50">{t.role}</div>
              </div>
            ))}
          </div>

          {/* 이중화 · 백업 서버 결계 */}
          <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-1.5 rounded-xl border border-gold-500/40 bg-grim-900/50 px-5 py-4 text-center">
            <div className="font-display text-[13px] tracking-widest text-gold-400">
              🜂 이중화 결계 · 백업 서버
            </div>
            <p className="text-[12px] leading-relaxed text-parchment/60">
              본진이 쓰러져도 수련지도는 멈추지 않는다. 예비 신전이 즉시 이어받도록 백업 서버를 함께 세웠다.
            </p>
            <a
              href="https://valuehost.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-gold-500/50 bg-grim-800 px-3 py-1.5 font-mono text-[12px] text-gold-300 transition hover:bg-grim-700 hover:text-gold-200"
            >
              🔗 valuehost.space
              <span aria-hidden>↗</span>
            </a>
          </div>
        </section>

        {/* ── Footer CTA ───────────────────────── */}
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-gold-500/40 bg-gradient-to-b from-grim-700/60 to-grim-800/60 px-6 py-10 text-center">
          <h2 className="font-display text-2xl font-extrabold text-gold-300">이제, 수련을 시작할 시간</h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-parchment/60">
            지도를 펼쳐 첫 룬을 누르고, 오늘 배운 지식을 현자에게 바쳐 새 가지를 틔워 보라.
          </p>
          <EnterButton className="mt-6" />
        </div>

        <p className="mt-10 text-center text-[11px] text-parchment/35">
          ※ 비밀의 주문은 이전 수련을 완전히 마무리했을 때 영롱하게 깨어납니다.
        </p>
      </div>
    </div>
  )
}
